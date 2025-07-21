// IOC Detection and Defang Extension
class IOCDefangExtension {
  constructor() {
    this.buttons = new Map(); // Track buttons by IOC text
    this.overlays = new Map();
    this.currentIOC = null;
    this.init();
  }

  init() {
    this.attachEventListeners();
    this.observeDOMChanges();
  }

  attachEventListeners() {
    // Listen for input events on text inputs and textareas
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[type="text"], input[type="url"], input[type="email"], textarea, [contenteditable="true"]')) {
        // Only check for new IOCs, don't reposition existing buttons
        this.handleInputForNewIOCs(e.target);
      }
    });

    // Listen for focus events to show buttons when focusing on IOC-containing inputs
    document.addEventListener('focusin', (e) => {
      if (e.target.matches('input[type="text"], input[type="url"], input[type="email"], textarea, [contenteditable="true"]')) {
        // Hide buttons for other inputs when focusing on a new input
        this.hideButtonsForOtherInputs(e.target);
        this.handleInput(e.target);
      }
    });

    // Hide buttons when clicking outside
    document.addEventListener('click', (e) => {
      const isButtonClick = e.target.classList.contains('ioc-defang-btn');
      const isInputClick = e.target.matches('input[type="text"], input[type="url"], input[type="email"], textarea, [contenteditable="true"]');
      
      // Check if the clicked input has a button (contains IOCs)
      const hasButton = isInputClick && Array.from(this.buttons.values()).some(button => button.inputElement === e.target);
      
      // Hide buttons if clicking outside both buttons and inputs with IOCs
      if (!isButtonClick && !hasButton) {
        this.hideAllButtons();
      }
    });

    // Hide buttons when page becomes hidden (user navigates away)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.hideAllButtons();
      }
    });
  }

  observeDOMChanges() {
    // Watch for dynamically added inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const inputs = node.querySelectorAll ? node.querySelectorAll('input[type="text"], input[type="url"], input[type="email"], textarea, [contenteditable="true"]') : [];
            inputs.forEach(input => {
              input.addEventListener('input', (e) => this.handleInputForNewIOCs(e.target));
              input.addEventListener('focusin', (e) => this.handleInput(e.target));
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  handleInput(inputElement) {
    const value = inputElement.value || inputElement.textContent;
    const iocs = this.detectAllIOCs(value);
    
    if (iocs.length > 0) {
      this.showButtonsForIOCs(inputElement, iocs);
    }
    // Don't hide buttons when focusing on an input - let them persist until clicked
  }

  handleInputForNewIOCs(inputElement) {
    const value = inputElement.value || inputElement.textContent;
    const iocs = this.detectAllIOCs(value);
    
    // Check if we need to create new buttons for this input
    const existingButtons = Array.from(this.buttons.values()).filter(button => 
      button.inputElement === inputElement
    );
    
    if (iocs.length > 0 && existingButtons.length === 0) {
      // No existing buttons but IOCs found - create new buttons
      this.showButtonsForIOCs(inputElement, iocs);
    } else if (iocs.length === 0 && existingButtons.length > 0) {
      // No IOCs found but buttons exist - remove them
      this.removeButtonsForInput(inputElement);
    }
    // If IOCs exist and buttons exist, don't do anything (buttons stay in place)
  }

  detectAllIOCs(text) {
    if (!text) return [];

    const iocs = [];
    console.log('IOC Defang: Starting IOC detection for text:', text);
    console.log('IOC Defang: Text length:', text.length);
    console.log('IOC Defang: Text contains newlines:', text.includes('\n'));

    // IP Address patterns - simple and reliable
    const ipv4Pattern = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    const ipv6Pattern = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}\b|\b(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}\b|\b(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}\b|\b[0-9a-fA-F]{1,4}:(?:(?::[0-9a-fA-F]{1,4}){1,6})\b|\b:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)\b|\bfe80:(?::[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}\b|\b::(?:ffff(?::0{1,4}){0,1}:){0,1}(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\b|\b(?:[0-9a-fA-F]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(?:25[0-5]|(?:2[0-4]|1{0,1}[0-9]){0,1}[0-9])\b/g;

    // URL pattern - simple and permissive
    const urlPattern = /https?:\/\/[^\s]+/g;
    
    // Domain patterns - simple
    const domainPattern = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
    
    // Email patterns - simple
    const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;

    // Find all matches with their positions
    let match;
    
    // Check for IPv4 addresses
    while ((match = ipv4Pattern.exec(text)) !== null) {
      console.log('IOC Defang: Found IPv4:', match[0], 'at position:', match.index);
      iocs.push({
        type: 'IPv4',
        original: match[0],
        defanged: this.defangIPv4(match[0]),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Check for IPv6 addresses
    while ((match = ipv6Pattern.exec(text)) !== null) {
      console.log('IOC Defang: Found IPv6:', match[0], 'at position:', match.index);
      iocs.push({
        type: 'IPv6',
        original: match[0],
        defanged: this.defangIPv6(match[0]),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Check for URLs (highest priority to avoid conflicts)
    while ((match = urlPattern.exec(text)) !== null) {
      console.log('IOC Defang: Found URL:', match[0], 'at position:', match.index);
      iocs.push({
        type: 'URL',
        original: match[0],
        defanged: this.defangURL(match[0]),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Check for email addresses (before domains to avoid conflicts)
    while ((match = emailPattern.exec(text)) !== null) {
      console.log('IOC Defang: Found Email:', match[0], 'at position:', match.index);
      iocs.push({
        type: 'Email',
        original: match[0],
        defanged: this.defangEmail(match[0]),
        start: match.index,
        end: match.index + match[0].length
      });
    }

    // Check for standalone domains (exclude those that are part of URLs or emails)
    while ((match = domainPattern.exec(text)) !== null) {
      const domain = match[0];
      const start = match.index;
      const end = start + domain.length;
      
      // Check if this domain is part of a URL or email (avoid duplicates)
      const beforeText = text.substring(Math.max(0, start - 30), start);
      const afterText = text.substring(end, Math.min(text.length, end + 30));
      
      // More precise checking for URL/email context
      const isPartOfURL = /https?:\/\/[^\/]*$/.test(beforeText) || 
                          beforeText.includes('://') || 
                          beforeText.includes('http');
      const isPartOfEmail = beforeText.includes('@') && !afterText.includes('@');
      
      // Check if this domain overlaps with any existing IOCs
      const overlapsWithExisting = iocs.some(ioc => 
        (start >= ioc.start && start < ioc.end) || 
        (end > ioc.start && end <= ioc.end) ||
        (start <= ioc.start && end >= ioc.end)
      );
      
      // Only include if it's clearly not part of a URL or email and doesn't overlap
      if (!isPartOfURL && !isPartOfEmail && !overlapsWithExisting) {
        console.log('IOC Defang: Found Domain:', domain, 'at position:', start);
        iocs.push({
          type: 'Domain',
          original: domain,
          defanged: this.defangDomain(domain),
          start: start,
          end: end
        });
      } else {
        console.log('IOC Defang: Skipping domain as part of URL/email or overlapping:', domain);
      }
    }

    // Sort IOCs by start position to ensure proper order
    iocs.sort((a, b) => a.start - b.start);
    
    console.log('IOC Defang: Final IOC list:', iocs);

    return iocs;
  }

  defangIPv4(ip) {
    // Replace every period (".") in IP addresses with "[.]"
    return ip.replace(/\./g, '[.]');
  }

  defangIPv6(ip) {
    // IPv6 addresses should be wrapped in brackets according to IETF standard
    // This prevents them from being interpreted as URLs
    return `[${ip}]`;
  }

  defangURL(url) {
    // Replace "http" and "https" schemes with "hxxp" and "hxxps" respectively
    // Replace every period (".") in domain names with "[.]"
    // Replace the "@" character in credentials with "[@]"
    return url
      .replace(/^https?:\/\//, (match) => {
        return match.replace('http', 'hxxp').replace('https', 'hxxps');
      })
      .replace(/\./g, '[.]')
      .replace(/@/g, '[@]');
  }

  defangDomain(domain) {
    // Replace every period (".") in domain names with "[.]"
    return domain.replace(/\./g, '[.]');
  }

  defangEmail(email) {
    // Replace the "@" character with "[@]"
    // Replace every period (".") in domain names with "[.]"
    return email
      .replace(/@/g, '[@]')
      .replace(/\./g, '[.]');
  }

  showButtonsForIOCs(inputElement, iocs) {
    // Validate input element before proceeding
    if (!inputElement || !document.contains(inputElement)) {
      console.warn('IOC Defang: Invalid input element for showing buttons');
      return;
    }
    
    console.log('IOC Defang: Detected IOCs:', iocs);
    console.log('IOC Defang: Input element:', inputElement);
    console.log('IOC Defang: Input element type:', inputElement.tagName);
    console.log('IOC Defang: Input element value length:', inputElement.value ? inputElement.value.length : 'no value');
    
    // Remove any existing buttons for this input first
    this.removeButtonsForInput(inputElement);
    
    // Create individual buttons for each IOC
    iocs.forEach((ioc, index) => {
      try {
        console.log(`IOC Defang: Creating button for IOC ${index + 1}:`, ioc);
        console.log(`IOC Defang: IOC type: ${ioc.type}, start: ${ioc.start}, end: ${ioc.end}`);
        
        // Check if we already have a button for this exact IOC at this position
        const buttonKey = `${inputElement}-${ioc.original}-${ioc.start}`;
        if (this.buttons.has(buttonKey)) {
          console.log(`IOC Defang: Button already exists for IOC at position ${ioc.start}, skipping`);
          return;
        }
        
        const button = this.createDefangButton(ioc, inputElement);
        if (button) {
          console.log(`IOC Defang: Successfully created button for IOC ${index + 1}`);
          // Use IOC original text as key to avoid duplicates
          this.buttons.set(buttonKey, button);
          
          // Position button underneath the specific IOC (hidden by default)
          this.positionButtonUnderIOC(button, inputElement, ioc);
          
          // Create hover detection for this IOC
          this.createHoverDetection(inputElement, ioc, button);
        } else {
          console.error(`IOC Defang: Failed to create button for IOC ${index + 1}`);
        }
      } catch (error) {
        console.error('IOC Defang: Error creating button for IOC', error);
      }
    });
    
    console.log(`IOC Defang: Finished creating buttons. Total buttons for this input: ${this.buttons.size}`);
    
    // Add resize listener to update positions
    this.addPositionUpdateListeners(inputElement);
  }

  createHoverDetection(inputElement, ioc, button) {
    try {
      // Create a transparent overlay div that covers the IOC text
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.zIndex = '9999';
      overlay.style.cursor = 'pointer';
      overlay.style.backgroundColor = 'transparent';
      
      // Calculate the position and size of the IOC text
      const rect = inputElement.getBoundingClientRect();
      const text = inputElement.value || inputElement.textContent || '';
      
      // Create temporary spans to measure text dimensions
      const beforeSpan = document.createElement('span');
      beforeSpan.style.font = window.getComputedStyle(inputElement).font;
      beforeSpan.style.visibility = 'hidden';
      beforeSpan.style.position = 'absolute';
      beforeSpan.style.whiteSpace = 'pre';
      beforeSpan.textContent = text.substring(0, ioc.start);
      document.body.appendChild(beforeSpan);
      
      const iocSpan = document.createElement('span');
      iocSpan.style.font = window.getComputedStyle(inputElement).font;
      iocSpan.style.visibility = 'hidden';
      iocSpan.style.position = 'absolute';
      iocSpan.style.whiteSpace = 'pre';
      iocSpan.textContent = ioc.original;
      document.body.appendChild(iocSpan);
      
      const textBeforeIOC = beforeSpan.offsetWidth;
      const iocWidth = iocSpan.offsetWidth;
      
      document.body.removeChild(beforeSpan);
      document.body.removeChild(iocSpan);
      
      // Calculate line position
      const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight) || 20;
      const lines = text.substring(0, ioc.start).split('\n');
      const currentLine = lines.length - 1;
      const verticalOffset = currentLine * lineHeight;
      
      // Position the overlay over the IOC text
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      overlay.style.top = `${rect.top + verticalOffset + scrollTop}px`;
      overlay.style.left = `${rect.left + textBeforeIOC + scrollLeft}px`;
      overlay.style.width = `${iocWidth}px`;
      overlay.style.height = `${lineHeight}px`;
      
      // Add hover events with improved logic
      overlay.addEventListener('mouseenter', () => {
        console.log('IOC Defang: Hover detected on IOC:', ioc.original);
        button.style.display = 'block';
        setTimeout(() => {
          button.classList.add('ioc-visible');
        }, 10);
      });
      
      overlay.addEventListener('mouseleave', (e) => {
        // Check if mouse is moving to the button
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && (relatedTarget === button || button.contains(relatedTarget))) {
          console.log('IOC Defang: Mouse moving to button, keeping visible');
          return; // Don't hide if moving to button
        }
        
        console.log('IOC Defang: Mouse leaving IOC, hiding button');
        button.classList.remove('ioc-visible');
        setTimeout(() => {
          if (!button.matches(':hover')) {
            button.style.display = 'none';
          }
        }, 1500); // Increased from 1000ms to 1500ms (1.5 seconds)
      });
      
      // Add hover events to the button itself
      button.addEventListener('mouseenter', () => {
        console.log('IOC Defang: Mouse entering button');
        button.style.display = 'block';
        button.classList.add('ioc-visible');
      });
      
      button.addEventListener('mouseleave', (e) => {
        // Check if mouse is moving back to the overlay
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && (relatedTarget === overlay || overlay.contains(relatedTarget))) {
          console.log('IOC Defang: Mouse moving back to IOC, keeping visible');
          return; // Don't hide if moving back to IOC
        }
        
        console.log('IOC Defang: Mouse leaving button, hiding');
        button.classList.remove('ioc-visible');
        setTimeout(() => {
          if (!overlay.matches(':hover')) {
            button.style.display = 'none';
          }
        }, 1500); // Increased from 1000ms to 1500ms (1.5 seconds)
      });
      
      // Store reference to overlay for cleanup
      button.overlay = overlay;
      
      // Add overlay to DOM
      document.body.appendChild(overlay);
      
      console.log('IOC Defang: Created hover detection for IOC:', ioc.original);
      
    } catch (error) {
      console.error('IOC Defang: Error creating hover detection', error);
    }
  }

  removeButtonsForInput(inputElement) {
    // Remove all buttons and overlays for this input element
    for (const [key, button] of this.buttons.entries()) {
      if (key.startsWith(inputElement.toString())) {
        this.removeButton(button);
      }
    }
    
    // Remove all overlays for this input element
    for (const [key, overlay] of this.overlays.entries()) {
      if (key.startsWith(inputElement.toString())) {
        if (overlay && overlay.parentNode) {
          overlay.parentNode.removeChild(overlay);
        }
        this.overlays.delete(key);
      }
    }
  }

  addPositionUpdateListeners(inputElement) {
    const updatePositions = () => {
      try {
        // Check if inputElement is still valid
        if (!inputElement || !document.contains(inputElement)) {
          // If input element is gone, remove all buttons for this input
          this.buttons.forEach((button, key) => {
            if (button.inputElement === inputElement) {
              this.removeButton(button);
            }
          });
          return;
        }
        
        // Update positions of all buttons for this input
        this.buttons.forEach((button, key) => {
          if (button.inputElement === inputElement && button.ioc && document.contains(button)) {
            this.positionButtonUnderIOC(button, inputElement, button.ioc);
          }
        });
      } catch (error) {
        console.error('IOC Defang: Error updating button positions', error);
      }
    };
    
    // Only listen for resize events since we're using fixed positioning
    window.addEventListener('resize', updatePositions);
    
    // Store the listeners for cleanup
    this.currentListeners = updatePositions;
  }

  // findIOCForButton method removed - no longer needed with single button per input approach

  createDefangButton(ioc, inputElement) {
    const button = document.createElement('button');
    button.className = 'ioc-defang-btn';
    button.textContent = 'Defang';
    button.style.display = 'none'; // Hidden by default, shown on hover
    
    // Store IOC data on the button
    button.dataset.original = ioc.original;
    button.dataset.defanged = ioc.defanged;
    button.dataset.iocType = ioc.type;
    button.dataset.start = ioc.start;
    
    // Store reference to the input element directly
    button.inputElement = inputElement;
    button.ioc = ioc;
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.defangIOC(button);
    });
    
    document.body.appendChild(button);
    return button;
  }

  // Reposition all active buttons when scroll or resize occurs
  repositionAllButtons() {
    try {
      this.buttons.forEach((button) => {
        if (button && button.inputElement && button.dataset.original) {
          this.positionButtonUnderIOC(button, button.inputElement, {
            original: button.dataset.original,
            start: button.dataset.start || 0
          });
          
          // Also reposition the overlay if it exists
          if (button.overlay && button.ioc) {
            this.repositionOverlay(button.inputElement, button.ioc, button.overlay);
          }
        }
      });
    } catch (error) {
      console.error('IOC Defang: Error repositioning buttons', error);
    }
  }

  repositionOverlay(inputElement, ioc, overlay) {
    try {
    const rect = inputElement.getBoundingClientRect();
      const text = inputElement.value || inputElement.textContent || '';
      
      // Create temporary spans to measure text dimensions
      const beforeSpan = document.createElement('span');
      beforeSpan.style.font = window.getComputedStyle(inputElement).font;
      beforeSpan.style.visibility = 'hidden';
      beforeSpan.style.position = 'absolute';
      beforeSpan.style.whiteSpace = 'pre';
      beforeSpan.textContent = text.substring(0, ioc.start);
      document.body.appendChild(beforeSpan);
      
      const iocSpan = document.createElement('span');
      iocSpan.style.font = window.getComputedStyle(inputElement).font;
      iocSpan.style.visibility = 'hidden';
      iocSpan.style.position = 'absolute';
      iocSpan.style.whiteSpace = 'pre';
      iocSpan.textContent = ioc.original;
      document.body.appendChild(iocSpan);
      
      const textBeforeIOC = beforeSpan.offsetWidth;
      const iocWidth = iocSpan.offsetWidth;
      
      document.body.removeChild(beforeSpan);
      document.body.removeChild(iocSpan);
      
      // Calculate line position
      const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight) || 20;
      const lines = text.substring(0, ioc.start).split('\n');
      const currentLine = lines.length - 1;
      const verticalOffset = currentLine * lineHeight;
      
      // Position the overlay over the IOC text
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      overlay.style.top = `${rect.top + verticalOffset + scrollTop}px`;
      overlay.style.left = `${rect.left + textBeforeIOC + scrollLeft}px`;
      overlay.style.width = `${iocWidth}px`;
      overlay.style.height = `${lineHeight}px`;
    } catch (error) {
      console.error('IOC Defang: Error repositioning overlay', error);
    }
  }

  // Position button underneath the IOC text
  positionButtonUnderIOC(button, inputElement, ioc) {
    try {
      // Add null checks
      if (!button || !inputElement || !ioc) {
        console.warn('IOC Defang: Missing required parameters for positioning', { button, inputElement, ioc });
        return;
      }
      
      // Check if the input element is still in the DOM
      if (!document.contains(inputElement)) {
        console.warn('IOC Defang: Input element no longer exists in DOM for positioning');
        return;
      }
      
      const rect = inputElement.getBoundingClientRect();
      
      // Get the text content and calculate more precise positioning
      const text = inputElement.value || inputElement.textContent || '';
      
      // Create a temporary span to measure text width more accurately
      const tempSpan = document.createElement('span');
      tempSpan.style.font = window.getComputedStyle(inputElement).font;
      tempSpan.style.visibility = 'hidden';
      tempSpan.style.position = 'absolute';
      tempSpan.style.whiteSpace = 'pre';
      tempSpan.textContent = text.substring(0, ioc.start);
      document.body.appendChild(tempSpan);
      
      const textBeforeIOC = tempSpan.offsetWidth;
      document.body.removeChild(tempSpan);
      
      // Calculate the IOC width
      const iocSpan = document.createElement('span');
      iocSpan.style.font = window.getComputedStyle(inputElement).font;
      iocSpan.style.visibility = 'hidden';
      iocSpan.style.position = 'absolute';
      iocSpan.style.whiteSpace = 'pre';
      iocSpan.textContent = ioc.original;
      document.body.appendChild(iocSpan);
      
      const iocWidth = iocSpan.offsetWidth;
      document.body.removeChild(iocSpan);
      
      // Calculate the exact center of the IOC text itself
      // This is the key: we center based on the IOC text, not the textbox
      const iocTextStartX = rect.left + textBeforeIOC;
      const iocTextCenterX = iocTextStartX + (iocWidth / 2);
      
      // Position the button so its center aligns with the IOC text center
      const buttonLeft = iocTextCenterX - (button.offsetWidth / 2);
      
      // Calculate vertical position to position button underneath the IOC text
      const lineHeight = parseInt(window.getComputedStyle(inputElement).lineHeight) || 20;
      const lines = text.substring(0, ioc.start).split('\n');
      const currentLine = lines.length - 1;
      const verticalOffset = currentLine * lineHeight;
      
      // Use absolute positioning with document coordinates (add scroll offset)
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      button.style.position = 'absolute';
      button.style.top = `${rect.top + verticalOffset + lineHeight + 8 + scrollTop}px`;
      button.style.left = `${buttonLeft + scrollLeft}px`;
      button.style.zIndex = '10000';
      button.style.display = 'block';
      
    } catch (error) {
      console.error('IOC Defang: Error positioning button', error);
    }
  }

  defangIOC(button) {
    try {
      const inputElement = button.inputElement;
      const originalText = button.dataset.original;
      const defangedText = button.dataset.defanged;
      const start = parseInt(button.dataset.start);
      
      if (!inputElement || !originalText || !defangedText) {
        console.error('IOC Defang: Missing data for defanging');
        return;
      }
      
      // Get the current text content
      const currentText = inputElement.value || inputElement.textContent || '';
      
      // Replace the original text with the defanged version
      const beforeText = currentText.substring(0, start);
      const afterText = currentText.substring(start + originalText.length);
      const newText = beforeText + defangedText + afterText;
      
      // Update the input element
      if (inputElement.tagName === 'TEXTAREA' || inputElement.tagName === 'INPUT') {
        inputElement.value = newText;
      } else {
        inputElement.textContent = newText;
      }
      
      // Trigger input event to update any listeners
      const event = new Event('input', { bubbles: true });
      inputElement.dispatchEvent(event);
      
      console.log('IOC Defang: Defanged IOC:', originalText, '->', defangedText);
      
      // Remove the button and overlay after successful defanging
      this.removeButton(button);
      
    } catch (error) {
      console.error('IOC Defang: Error defanging IOC', error);
    }
  }

  removeButton(button) {
    try {
      if (!button) {
        return;
      }
      
      // Remove the overlay if it exists
      if (button.overlay && button.overlay.parentNode) {
        button.overlay.parentNode.removeChild(button.overlay);
      }
      
      button.classList.remove('ioc-visible');
      setTimeout(() => {
        try {
          if (button.parentNode) {
            button.parentNode.removeChild(button);
          }
          // Remove from buttons map using the key
          this.buttons.forEach((btn, key) => {
            if (btn === button) {
              this.buttons.delete(key);
            }
          });
        } catch (error) {
          console.error('IOC Defang: Error removing button from DOM', error);
        }
      }, 200);
    } catch (error) {
      console.error('IOC Defang: Error in removeButton', error);
    }
  }

  hideAllButtons() {
    this.buttons.forEach((button) => {
      this.removeButton(button);
    });
    this.buttons.clear();
    
    // Clean up listeners
    if (this.currentListeners) {
      window.removeEventListener('resize', this.currentListeners);
      this.currentListeners = null;
    }
  }

  hideButtonsForOtherInputs(currentInput) {
    this.buttons.forEach((button, key) => {
      if (button.inputElement !== currentInput) {
        this.removeButton(button);
      }
    });
  }
}

// Global extension instance
let extension = null;

// Initialize the extension
function initializeExtension() {
  console.log('IOC Defang Extension v0.3.0 initialized');
  extension = new IOCDefangExtension();
  extension.init();
  
  // Add scroll and resize listeners to the extension
  const scrollHandler = () => {
    if (extension) {
      extension.repositionAllButtons();
    }
  };
  window.addEventListener('scroll', scrollHandler, true);
  
  const resizeHandler = () => {
    if (extension) {
      extension.repositionAllButtons();
    }
  };
  window.addEventListener('resize', resizeHandler);
}

// Initialize the extension when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
    new IOCDefangExtension();
    } catch (error) {
      console.error('IOC Defang: Failed to initialize extension', error);
    }
  });
} else {
  try {
  new IOCDefangExtension();
  } catch (error) {
    console.error('IOC Defang: Failed to initialize extension', error);
  }
} 