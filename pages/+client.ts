// pages/+client.ts

export default () => {
    // Replace with your own GA4 Measurement ID
    const GA_MEASUREMENT_ID = 'G-4P688CTR6M'
  
    // Check if the script is already injected
    if (!document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
      // 1. Load the Google Analytics script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script)
  
      // 2. Initialize gtag
      script.onload = () => {
        window.dataLayer = window.dataLayer || []
        function gtag(...args: unknown[]) {
          window.dataLayer.push(args)
        }
  
        gtag('js', new Date())
        gtag('config', GA_MEASUREMENT_ID, {
          page_path: window.location.pathname,
        })
  
        // Optional: track route changes with Vike
        const unlisten = window.addEventListener('popstate', () => {
          gtag('config', GA_MEASUREMENT_ID, {
            page_path: window.location.pathname,
          })
        })
      }
    }
  }
  