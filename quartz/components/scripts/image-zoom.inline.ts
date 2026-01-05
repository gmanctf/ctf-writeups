// Image zoom functionality
let zoomModal: HTMLElement | null = null
let currentImage: HTMLImageElement | null = null

function createZoomModal() {
  if (zoomModal) return zoomModal

  zoomModal = document.createElement('div')
  zoomModal.className = 'image-zoom-modal'
  zoomModal.innerHTML = `
    <div class="image-zoom-content">
      <div class="image-zoom-close">×</div>
      <img src="" alt="" />
    </div>
  `

  document.body.appendChild(zoomModal)

  // Close modal when clicking overlay or close button
  zoomModal.addEventListener('click', (e) => {
    const closeButton = zoomModal.querySelector('.image-zoom-close')
    if (e.target === zoomModal || (closeButton && e.target === closeButton)) {
      closeZoomModal()
    }
  })

  // Prevent clicks on modal content from closing modal
  const modalContent = zoomModal.querySelector('.image-zoom-content')
  modalContent?.addEventListener('click', (e) => {
    e.stopPropagation()
  })

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && zoomModal && zoomModal.classList.contains('active')) {
      closeZoomModal()
    }
  })

  return zoomModal
}

function openZoomModal(img: HTMLImageElement) {
  console.log('Opening zoom modal for:', img.src)
  const modal = createZoomModal()
  const modalImg = modal.querySelector('img') as HTMLImageElement

  modalImg.src = img.src
  modalImg.alt = img.alt || 'Zoomed image'

  modal.classList.add('active')
  document.body.style.overflow = 'hidden' // Prevent background scrolling

  console.log('Modal activated')
  currentImage = img
}

function closeZoomModal() {
  console.log('Closing zoom modal')
  if (zoomModal) {
    zoomModal.classList.remove('active')
    document.body.style.overflow = '' // Restore scrolling
  }
  currentImage = null
}

// Initialize image zoom on page load
function initializeImageZoom() {
  console.log('Initializing image zoom...')

  // Add click handlers to all images in content
  const contentImages = document.querySelectorAll('.page article img, .page-footer img')
  console.log('Found', contentImages.length, 'images to make zoomable')

  contentImages.forEach((img, index) => {
    const imageElement = img as HTMLImageElement
    if (!imageElement.hasAttribute('data-zoom-initialized')) {
      console.log('Setting up zoom for image', index, imageElement.src)
      imageElement.style.cursor = 'zoom-in'
      imageElement.setAttribute('data-zoom-initialized', 'true')
      imageElement.addEventListener('click', (e) => {
        console.log('Image clicked:', imageElement.src)
        e.preventDefault()
        e.stopPropagation()
        openZoomModal(imageElement)
      })
    }
  })
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing image zoom')
  initializeImageZoom()
})

// Handle dynamically loaded content (for SPA navigation)
document.addEventListener('nav', () => {
  console.log('Navigation event, reinitializing image zoom')
  setTimeout(() => {
    initializeImageZoom()
  }, 100)
})
