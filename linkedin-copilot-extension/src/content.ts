// Function to create and inject the Save to Co-pilot button
function createSaveButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = 'Save to Co-pilot';
  button.className = 'save-to-copilot-btn';
  button.style.cssText = `
    background-color: #0a66c2;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 14px;
    cursor: pointer;
    margin: 8px 0;
  `;
  
  button.addEventListener('click', handleSaveClick);
  return button;
}

// Function to handle button click
async function handleSaveClick(event: MouseEvent) {
  const button = event.target as HTMLButtonElement;
  const postContainer = button.closest('.feed-shared-update-v2');
  
  if (!postContainer) return;

  try {
    const postData = extractPostData(postContainer);
    // TODO: Send data to backend
    console.log('Post data:', postData);
  } catch (error) {
    console.error('Error saving post:', error);
  }
}

// Function to extract post data
function extractPostData(postContainer: Element) {
  return {
    textContent: postContainer.querySelector('.feed-shared-update-v2__description')?.textContent?.trim() || '',
    authorName: postContainer.querySelector('.feed-shared-actor__name')?.textContent?.trim() || '',
    authorProfileUrl: postContainer.querySelector('.feed-shared-actor__name')?.getAttribute('href') || '',
    linkedinPostUrl: window.location.href,
    originalPostDate: postContainer.querySelector('.feed-shared-actor__sub-description')?.textContent?.trim() || '',
    userId: '' // TODO: Get from session/auth
  };
}

// Function to initialize the content script
function initialize() {
  // Create a MutationObserver to watch for new posts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          const posts = node.querySelectorAll('.feed-shared-update-v2');
          posts.forEach((post) => {
            if (!post.querySelector('.save-to-copilot-btn')) {
              const button = createSaveButton();
              post.appendChild(button);
            }
          });
        }
      });
    });
  });

  // Start observing the feed
  const feed = document.querySelector('.scaffold-finite-scroll');
  if (feed) {
    observer.observe(feed, { childList: true, subtree: true });
  }
}

// Initialize when the page is loaded
initialize(); 