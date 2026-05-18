# Understanding Console Errors on Windows 10 (Vercel Deployment)

When viewing your Vercel deployment (`cuchd-in-daa-page.vercel.app/clubs`) on a Windows 10 system, you observed several `net::ERR_CERT_AUTHORITY_INVALID` errors and an `aria-hidden` accessibility warning in the browser console.

Below is a detailed breakdown of why these errors occur, the underlying architecture of the tracking scripts, and the exact steps taken to resolve them.

---

## 1. Accessibility Warning: `Blocked aria-hidden on an element` (SUCCESSFULLY RESOLVED)

### The Observed Warning
```text
clubs:1 Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead...
Element with focus: <div.modal fade#clubModal>
Ancestor with aria-hidden: <div.modal fade#clubModal>
```

### Understanding the Warning
This is a modern accessibility (a11y) safeguard enforced by Chromium-based browsers (Chrome, Edge).
* When a Bootstrap modal (`#clubModal`) is closed, Bootstrap automatically applies `aria-hidden="true"` to the modal container to inform screen readers that the popup is no longer visible.
* However, if an element inside the modal retains active keyboard focus during the closing transition, the browser detects a contradiction: an element cannot be actively focused by a user while simultaneously telling assistive technologies that it is hidden.
* To prevent screen readers from entering a broken state, the browser ignores/blocks the `aria-hidden` attribute and logs this warning.

### The Code-Level Resolution
To permanently eliminate this warning across the entire portal, we implemented proactive focus management inside the modal cleanup logic across all portal pages (`clubs.html`, `clubv2.html`, `communities.html`, `professional-societies.html`, `departmental-societies.html`, and `index.html`).

```javascript
// Inside the self-executing script on clubs.html and related portal pages:
document.addEventListener('hide.bs.modal', function(e) {
    if (e.target.id === 'clubModal') {
        // PROACTIVE FOCUS MANAGEMENT: Remove focus before hiding
        if (document.activeElement) {
            document.activeElement.blur();
        }
        if (fortressInterval) clearInterval(fortressInterval);
        var cInner = e.target.querySelector('#clubCarouselInner');
        var catDiv = e.target.querySelector('#modalClubCategories');
        if (cInner) cInner.innerHTML = '';
        if (catDiv) catDiv.innerHTML = '';
    }
}, true);
```

**Verification:** Upon re-testing the `clubs` page, this `aria-hidden` console warning no longer appears. The modal focus management fix is 100% successful.

---

## 2. `net::ERR_CERT_AUTHORITY_INVALID` on Tracking & Ad Domains

### The Observed Errors & Stack Trace
```text
VM261 gtm.js:293  GET https://s.adroll.com/j/roundtrip.js net::ERR_CERT_AUTHORITY_INVALID
...
PendingScript
(anonymous) @ clubs:262
(anonymous) @ clubs:263

js?id=AW-955916751&cx=c&gtm=4e65d0:209  GET https://googleads.g.doubleclick.net/pagead/viewthroughconversion/955916751/... net::ERR_CERT_AUTHORITY_INVALID

VM307 insight.old.min.js:1  GET https://px.ads.linkedin.com/attribution_trigger... net::ERR_CERT_AUTHORITY_INVALID
```

### Architectural Trace: Google Tag Manager (`clubs:262`)
If you inspect the stack trace in Chrome DevTools, you will notice it points directly to `clubs:262` and `clubs:263`, which then executes `VM261 gtm.js:293`.

**What is happening under the hood?**
Lines 258-264 of `clubs.html` contain the Google Tag Manager (GTM) snippet:
```html
<!-- Google Tag Manager snippet in clubs.html -->
<script>
 (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WGZBMSV');
</script>
```
1. **Initial Load (`clubs:262`):** The browser executes this inline script, which fetches the dynamic GTM container (`https://www.googletagmanager.com/gtm.js?id=GTM-WGZBMSV`).
2. **Container Execution (`VM261 gtm.js`):** Once GTM loads, it evaluates the marketing rules configured on Google's servers by the university's marketing team.
3. **Dynamic Pixel Injection (`gtm.js:293`):** GTM dynamically creates `<script>` and `<img>` tags to inject third-party tracking beacons:
   * `s.adroll.com/j/roundtrip.js` (AdRoll remarketing)
   * `googleads.g.doubleclick.net` (Google Ads conversion tracking)
   * `px.ads.linkedin.com` (LinkedIn Insight Tag)

### Why is this happening on the Windows 10 machine but not your laptop?
Because your main web application (`cuchd-in-daa-page.vercel.app`) loads successfully, **there is nothing wrong with your Vercel deployment or its SSL certificate**. The issue is strictly related to how the Windows 10 system (or its network environment) handles external tracking and advertising scripts.

Here are the most common causes for this specific behavior on a Windows 10 machine:

#### A. Antivirus / Internet Security Software (HTTPS / Web Shield Inspection)
Many popular antivirus programs (such as Avast, Kaspersky, Bitdefender, AVG, ESET, or Malwarebytes) feature a "Web Shield" or "HTTPS Scanning" module.
* **How it works:** To scan encrypted HTTPS traffic for malware or to block known tracking/ad domains, the antivirus intercepts the secure connection and presents its own self-signed root certificate to the browser.
* **The Error:** If the browser (especially Chromium/Chrome, which uses its own independent root certificate store rather than the Windows system store) does not trust the antivirus's local root certificate, or if the antivirus intentionally serves an invalid certificate to terminate the connection to ad trackers, the browser aborts the request with `net::ERR_CERT_AUTHORITY_INVALID`.

#### B. System-Level Ad Blockers or DNS Sinkholes
* **Local Proxies/Ad Blockers:** Tools like AdGuard for Windows, Privoxy, or Fiddler intercept web traffic at the system level.
* **DNS Filtering (e.g., Pi-hole, AdGuard DNS, Umbrella):** If the Windows 10 machine uses a secure DNS service or operates on a network with a DNS sinkhole configured to block ads, requests to `s.adroll.com`, `googleads.g.doubleclick.net`, and `px.ads.linkedin.com` are redirected to a local blockpage IP (e.g., `0.0.0.0` or `127.0.0.1`). When the browser attempts an HTTPS handshake with that local IP, the returned SSL certificate does not match the ad domain, resulting in `ERR_CERT_AUTHORITY_INVALID`.

### Actionable Advice & Recommendations
* **No Action Needed for Production:** This is a client-side environment issue on that specific Windows 10 machine. General visitors to your Vercel site will not experience this unless they also have aggressive antivirus web shields or ad blockers configured.
* **To Resolve on the Windows 10 Machine:**
    1. Check installed Antivirus software and temporarily disable "HTTPS Scanning" or "Web Shield" to verify if the errors disappear.
    2. Check if any system-level ad blockers, VPNs, or custom DNS settings (like AdGuard DNS) are active.
* **Application-Level Privacy Option (GTM Removal):** If the university no longer requires third-party tracking (LinkedIn Ads, Google Ads, AdRoll), you can completely eliminate these network console errors by removing the Google Tag Manager (`GTM-WGZBMSV`) and Google Analytics (`G-8N1BKMH5LY`) scripts from lines 241-265 of `clubs.html`.
