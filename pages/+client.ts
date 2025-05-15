// pages/+client.ts

export default () => {
    // Replace with your own GA4 Measurement ID
    const GA_MEASUREMENT_ID = 'G-4P688CTR6M'
  
    
  // Inject GA script if not already present
  if (!document.querySelector(`script[src*="gtag/js?id=${GA_MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    script.onload = () => {
      // Ensure dataLayer exists
      window.dataLayer = window.dataLayer || []

      // ✅ Attach gtag to window
      window.gtag = (...args: unknown[]) => {
        window.dataLayer.push(args)
      }

      // Initialize gtag
      window.gtag('js', new Date())
      window.gtag("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
      });
      }
    }
  }
  