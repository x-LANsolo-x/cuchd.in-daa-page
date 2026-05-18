# Understanding Console Errors on Windows 10 (Vercel Deployment)

When viewing your Vercel deployment (`cuchd-in-daa-page.vercel.app`) on a Windows 10 system, you observed several `net::ERR_CERT_AUTHORITY_INVALID` errors and an `aria-hidden` accessibility warning in the browser console, whereas your laptop shows no console errors.

Below is a detailed breakdown of why these errors occur, what they mean, and how to address them.

---

## 1. `net::ERR_CERT_AUTHORITY_INVALID` on Tracking & Ad Domains

### The Observed Errors
The console logs indicate that outgoing network requests to the following third-party domains failed with a certificate authority error:
*   `s.adroll.com` (AdRoll marketing/tracking)
*   `px.ads.linkedin.com` (LinkedIn Insight Tag / analytics)
*   `googleads.g.doubleclick.net` (Google Ads conversion tracking)
*   `stats.g.doubleclick.net` (Google Analytics / DoubleClick remarketing)

### Why is this happening on the Windows 10 machine but not your laptop?
Because your main web application (`cuchd-in-daa-page.vercel.app`) loads successfully, **there is nothing wrong with your Vercel deployment or its SSL certificate**. The issue is strictly related to how the Windows 10 system (or its network environment) handles external tracking and advertising scripts.

Here are the most common causes for this specific behavior on a Windows 10 machine:

#### A. Antivirus / Internet Security Software (HTTPS / Web Shield Inspection)
Many popular antivirus programs (such as Avast, Kaspersky, Bitdefender, AVG, ESET, or Malwarebytes) feature a "Web Shield" or "HTTPS Scanning" module.
*   **How it works:** To scan encrypted HTTPS traffic for malware or to block known tracking/ad domains, the antivirus intercepts the secure connection and presents its own self-signed root certificate to the browser.
*   **The Error:** If the browser (especially Chromium/Chrome, which uses its own independent root certificate store rather than the Windows system store) does not trust the antivirus's local root certificate, or if the antivirus intentionally serves an invalid certificate to terminate the connection to ad trackers, the browser aborts the request with `net::ERR_CERT_AUTHORITY_INVALID`.

#### B. System-Level Ad Blockers or DNS Sinkholes
*   **Local Proxies/Ad Blockers:** Tools like AdGuard for Windows, Privoxy, or Fiddler intercept web traffic at the system level.
*   **DNS Filtering (e.g., Pi-hole, AdGuard DNS, Umbrella):** If the Windows 10 machine uses a secure DNS service or operates on a network with a DNS sinkhole configured to block ads, requests to `googleads.g.doubleclick.net` are redirected to a local blockpage IP (e.g., `0.0.0.0` or `127.0.0.1`). When the browser attempts an HTTPS handshake with that local IP, the returned SSL certificate does not match the ad domain, resulting in `ERR_CERT_AUTHORITY_INVALID`.

#### C. Corporate Firewall / Secure Web Gateway (Zscaler, Fortinet, Palo Alto)
If the Windows 10 machine is a work computer or connected to a corporate network/VPN, enterprise firewalls perform SSL Decryption/Inspection. If the firewall categorizes these advertising domains as blocked or if the enterprise root certificate is missing from the browser's trust store, the connections fail with SSL certificate errors.

#### D. Outdated Windows Root Certificates or Incorrect System Clock
If the Windows 10 operating system is missing recent root certificate updates (e.g., Let's Encrypt ISRG Root X1, Google Trust Services GTS Root R1, or DigiCert root certs) or if the system clock/date is significantly out of sync, certificate validation fails. *(Note: Since the main Vercel site loads fine, this is less likely than AV/AdBlock interception).*

### Actionable Advice
*   **No Action Needed for Production:** This is a client-side environment issue on that specific Windows 10 machine. General visitors to your Vercel site will not experience this unless they also have aggressive antivirus web shields or ad blockers configured.
*   **To Resolve on the Windows 10 Machine:**
    1.  Check installed Antivirus software and temporarily disable "HTTPS Scanning" or "Web Shield" to verify if the errors disappear.
    2.  Check if any system-level ad blockers, VPNs, or custom DNS settings (like AdGuard DNS) are active.
    3.  Ensure the Windows 10 system clock and date are accurate.

---

## 2. `Blocked aria-hidden on an element because its descendant retained focus`

### The Observed Warning
```text
clubs:1 Blocked aria-hidden on an element because its descendant retained focus. The focus must not be hidden from assistive technology users. Avoid using aria-hidden on a focused element or its ancestor. Consider using the inert attribute instead...
Element with focus: <div.modal fade#clubModal>
Ancestor with aria-hidden: <div.modal fade#clubModal>
```

### What does this warning mean?
This is a modern accessibility (a11y) safeguard enforced by Chromium-based browsers (Chrome, Edge).
*   When a Bootstrap modal (`#clubModal`) is closed, Bootstrap automatically applies `aria-hidden="true"` to the modal container to inform screen readers that the popup is no longer visible.
*   However, if the modal element itself (or an element inside it) still retains active keyboard focus (`tabindex="-1"`), the browser detects a contradiction: an element cannot be actively focused by a user while simultaneously telling assistive technologies that it is hidden.
*   To prevent screen readers from entering a broken state, the browser ignores/blocks the `aria-hidden` attribute and logs this warning.

### Actionable Advice (How to Fix in Code)
If you wish to eliminate this console warning and improve accessibility, you can ensure that keyboard focus is properly returned to the main page before the modal finishes closing.

In your modal JavaScript closing logic (or Bootstrap modal event listener), add a step to blur the active element or return focus to the trigger button:

```javascript
// Example fix using Bootstrap modal hide event
const clubModalEl = document.getElementById('clubModal');
if (clubModalEl) {
    clubModalEl.addEventListener('hide.bs.modal', function () {
        // Remove focus from the modal before it gets hidden
        if (document.activeElement) {
            document.activeElement.blur();
        }
    });
}
``` Alternatively, modern web standards recommend using the HTML `inert` attribute for hidden dialogs.
