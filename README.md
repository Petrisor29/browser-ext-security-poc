# Browser Extension Security PoC: Dual-Behavior Tracker

## Project Description
This repository contains an academic Proof of Concept (PoC) illustrating the security risks associated with overly permissive browser extensions. The project demonstrates techniques used to mask malicious actions (DOM manipulation, stealth tracking) behind legitimate functionality (in this case, a Price Tracker).

This practical project was developed to consolidate formal technical training in web application security, specifically targeting the understanding and mitigation of client-side vulnerabilities.

## Features (Dual Behavior)

### 1. Legitimate Behavior (Price Tracker)
* **DOM Parsing:** Identifies and extracts prices (RON, LEI) from visited web pages, recognizing various formats (comma, dot, superscript).
* **Local History:** Builds a price history based on visited domains, saved locally within the browser.
* **User Interface:** Provides a functional popup UI with a user-triggered "Search Prices" button for manual updates.

### 2. Stealth Behavior (Tracking & Manipulation)
Hidden actions run in the background, exploiting the broad permissions initially granted for the price tracking functionality:
* **Activity Tracking & Logging:** Silently monitors browsing activity. It generates timestamped logs and synthesizes a natural language transcript of the session per domain, exclusively by interpreting raw data.
* **Targeted DOM Manipulation:** * *Content Injection:* At runtime, it seamlessly inserts predefined messages into the structure of specific web pages, inheriting the original CSS aesthetics to avoid suspicion and blend perfectly as native content.
    * *Link Hijacking:* Intercepts user actions from the seemingly harmless UI to silently modify the `href` attributes of specific page elements. Concurrently, the interface displays a standard error message ("No prices found") to disguise the underlying data alteration.

## Security Concepts Explored (Technical Notes)
* **Permission Abuse:** Demonstrates how broad access (e.g., `<all_urls>`), theoretically required for a global price tracker, opens the door to reading sensitive session data and rewriting page content.
* **Content Scripts vs. Background Scripts:** Highlights execution context isolation and the use of *Message Passing* between the extension's UI (popup) and injected scripts to trigger the hidden payload.
* **Evasion & Local Persistence:** Explores the technical challenges of storing and securing logs using only internal browser mechanisms, highlighting the limitations of client-side storage compared to exfiltration to a Command and Control (C2) server.

## Disclaimer
This project is strictly for **educational purposes**. It was created exclusively as study material to analyze attack techniques and develop defensive mechanisms. Do not use this code outside of authorized testing environments.