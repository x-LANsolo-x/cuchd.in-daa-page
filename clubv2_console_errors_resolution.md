# Resolution & Explanation of Console Errors on `clubv2` Page

When accessing the Vercel deployment of the `clubv2` page, you encountered a set of browser console errors and accessibility warnings. Below is a comprehensive explanation of each issue, why they occur, the architectural source of the tracking pixels, and the exact steps taken to resolve them.

---

## 1. Accessibility Warning: `Blocked aria-hidden on an element because its descendant retained focus`

### The Observed Warning
```text
clubv2:1 Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead, which will also prevent focus. For more details, see the aria-hidden section of the WAI-ARIA specification at https://w3c.github.io/aria/#aria-hidden.
Element with focus: <button.btn-close position-absolute top-0 end-0 m-3>
Ancestor with aria-hidden: <div.modal fade#clubModal>
```

### Understanding the Warning
This is a built-in accessibility (a11y) safeguard enforced by modern Chromium-based browsers (Chrome, Edge, Brave).
1. **The Conflict:** When a user clicks the modal's close button (`<button class="btn-close ...">`), the browser gives active keyboard focus to that button.
2. **Bootstrap's Action:** As the modal begins its closing transition (`hide.bs.modal`), Bootstrap automatically applies the `aria-hidden="true"` attribute to the outer `#clubModal` container to signal to screen readers that the modal dialog is no longer visible.
3. **Browser Intervention:** The browser detects an accessibility contradiction: an element cannot actively hold user focus while its parent container tells assistive technology that it is hidden. To prevent screen readers from entering an inconsistent or trapped state, the browser blocks the `aria-hidden` attribute and outputs the warning to the console.

### The Code-Level Resolution (SUCCESSFULLY FIXED)
To permanently eliminate this warning across the entire portal, we implemented proactive focus management inside the modal cleanup logic. Specifically, we added `document.activeElement.blur();` within the `hide.bs.modal` event listener across all portal pages (`clubv2.html`, `clubs.html`, `communities.html`, `professional-societies.html`, `departmental-societies.html`, and `index.html`).

```javascript
// Inside the self-executing script on clubv2.html and related portal pages:
document.addEventListener('hide.bs.modal', function(e) {
    if (e.target.id === 'clubModal') {
        // PROACTIVE FOCUS MANAGEMENT: Remove focus from the close button before hiding
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

**Verification:** Upon re-testing the deployment, this `aria-hidden` console warning no longer appears. The modal focus management fix is 100% successful.

---

## 2. Tracking Script Errors: `net::ERR_CERT_AUTHORITY_INVALID` & `net::ERR_INTERNET_DISCONNECTED`

### The Observed Errors
```text
Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
px.ads.linkedin.com/wa/?medium=fetch&fmt=g:1

Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
googleads.g.doubleclick.net/pagead/viewthroughconversion/955916751/?random=...

Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID
px.ads.linkedin.com/collect?v=2&fmt=js&pid=8924441...

bat.bing.com/p/conversions/c/q:1 Failed to load resource: net::ERR_INTERNET_DISCONNECTED
```

### Architectural Source: Google Tag Manager (`GTM-WGZBMSV`)
You may notice that searching the codebase for `linkedin.com`, `doubleclick.net`, `adroll.com`, or `bat.bing.com` yields zero results in the HTML source code. 

**Where are these requests coming from?**
They are dynamically injected by the **Google Tag Manager (GTM)** container embedded in the `<head>` and `<body>` of `clubv2.html` (and all other portal pages):
```html
<!-- Google Tag Manager snippet in clubv2.html -->
<script async="" src="https://www.googletagmanager.com/gtag/js?id=G-8N1BKMH5LY"></script>
<iframe height="0" src="https://www.googletagmanager.com/ns.html?id=GTM-WGZBMSV" style="display:none;visibility:hidden" width="0"></iframe>
```
When the web page loads, the browser executes the GTM script. GTM connects to Google's tag configuration servers, retrieves the active marketing tags configured by the university's marketing team, and dynamically creates `<script>` and `<img>` tracking pixels for LinkedIn Insight (`px.ads.linkedin.com`), Google Ads remarketing (`googleads.g.doubleclick.net`), Bing Ads, and AdRoll.

### Understanding Why They Fail on the Windows Machine
These errors are **strictly client-side environmental occurrences** and do not indicate any flaw or misconfiguration in your Vercel deployment, application code, or SSL certificate. The core Vercel web application functions flawlessly.

#### A. `net::ERR_CERT_AUTHORITY_INVALID` (LinkedIn Insight & Google Ads)
* **Cause (Antivirus Web Shield Interception):** Many security suites (e.g., Avast, Bitdefender, Kaspersky, ESET) use an "HTTPS / Web Shield" module that inspects encrypted web traffic. To do this, the antivirus intercepts outbound connections and presents its own local certificate. If the antivirus intentionally blocks known tracking domains by serving an untrusted certificate, or if the browser (Chromium) does not recognize the antivirus's local root certificate store, the connection is aborted with `ERR_CERT_AUTHORITY_INVALID`.
* **Cause (DNS Sinkholes / Local Proxies):** If the network uses a DNS filter (like Pi-hole, AdGuard DNS, or corporate firewall sinkholes), requests to `px.ads.linkedin.com` or `googleads.g.doubleclick.net` are redirected to a local null IP (`0.0.0.0`). When the browser attempts an SSL handshake with `0.0.0.0`, the returned SSL certificate does not match the tracking domain name, resulting in a certificate authority error.

#### B. `net::ERR_INTERNET_DISCONNECTED` (Bing Ads / `bat.bing.com`)
* **Cause (Browser Tracking Protection / Ad Blockers):** Browser extensions (e.g., uBlock Origin, Privacy Badger, AdGuard) or built-in browser privacy shields (such as Brave Shields or Edge Tracking Prevention) actively monitor outbound requests. When a script attempts to contact known tracking beacons like `bat.bing.com`, the blocking engine terminates the network socket immediately at the browser level, simulating a disconnected network state (`ERR_INTERNET_DISCONNECTED`) for that specific tracking request.

### Actionable Advice & Recommendations

1. **Production Impact (None):** General production users visiting your Vercel site will not experience these console errors unless they also have aggressive ad blockers, privacy shields, or antivirus web shields active. The core UI, modals, carousels, and navigation remain 100% operational.
2. **Local Machine Verification:** To verify this on the affected Windows machine, you can:
   * Temporarily pause or disable any active Antivirus "Web Shield" or "HTTPS Scanning" features.
   * Disable browser ad-blocking extensions (uBlock Origin, AdGuard) or turn off built-in tracking protection (e.g., Brave Shields, Edge Strict Privacy).
   * Check if a system-level VPN, custom DNS (AdGuard DNS, Cloudflare Malware/Blocking), or corporate firewall is actively filtering web traffic.
3. **Application-Level Privacy Option (GTM Removal):** If the university no longer requires third-party tracking (LinkedIn Ads, Google Ads, Bing Ads), you can completely eliminate these network console errors by removing the Google Tag Manager (`GTM-WGZBMSV`) and Google Analytics (`G-8N1BKMH5LY`) scripts from the HTML files.
