# System Prompt & Developer Guidelines: SahayataMoney B2B Fintech Portal

You are an expert React and Redux developer tasked with maintaining, building, and refactoring features in the **SahayataMoney B2B Fintech Portal** (betasourcesoftware-website). 

Below is the complete architectural reference, code structure, data models, state guidelines, and developer rules for this codebase. Refer to this document at all times to write consistent, clean, and bug-free code.

---

## 1. Project Overview & Tech Stack
* **Domain**: A B2B Fintech platform providing mobile & DTH recharge, utility bill payments (BBPS), AePS (Aadhar Enabled Payment System), DMT (Domestic Money Transfer), payouts, PAN card processing, and other financial services.
* **Core Technologies**: React 18.2, React Router DOM v6, Redux Toolkit.
* **Styling**: Scoped styling using **CSS Modules** (`[ComponentName].module.css`) and global utility themes from `index.css`.
* **API Utilities**: Axios (configured in `src/api/httpClient.js`) with request/response interceptors that automatically manage the global loader state, authorization headers, and success/error toasts.

---

## 2. Dynamic Styling & Site Configuration (`src/config/siteConfig.js`)
All pages, headers, sidebars, and widgets must read their visual properties and branding metadata from the centralized `SITE_CONFIG` object.
* **Branding Fields**: `companyName`, `brandName`, `shortName`, `ownerName`, `phone`, `email`, `address`, `copyright`.
* **Theme Styling Colors**: `headerColor`, `leftColor`, `bodyColor`. These define header, sidebar, and body background colors dynamically updated from backend configurations.
* **Images**: Centralized helpers resolve full image paths from the API:
  * `getImageUrl(filename, folder)` -> maps to `https://api.sahayatamoney.in/UploadedFiles/{folder}/{filename}`.
  * `getLogoUrl(filename)`, `getSignatureUrl(filename)`, `getFaviconUrl(filename)`.
* **Method**: Invoke `updateSiteConfig(apiData)` on app load to sync database branding values to the client.

---

## 3. Network & API Layer (`src/api/` & `src/services/`)
API interactions must use the centralized `httpClient.js` Axios wrapper.
* **Base URL**: `https://api.sahayatamoney.in/api`
* **Features**:
  * **Bearer Token Injection**: Automatically pulls `access_token` from `localStorage` and appends it to headers.
  * **Loader Orchestration**: Increments/decrements an active request counter to show/hide the global spinner overlay via Redux (`showLoader` / `hideLoader`).
  * **Response Status Routing**: Automatically reads response parameters (`resData.status`, `resData.code`, `resData.message`) to dispatch global success/error toasts (`setNotification`).
  * **Security Lookup**: `apiService.postWithSecurity(url, data)` runs an automatic IP lookup (`https://api.ipify.org`) and asks the browser for geolocation coordinates before appending it to payloads.
* **Central Endpoint Exporter (`src/api/endpoints.js`)**:
  * Consolidates all services under a single `API` object (e.g., `API.login`, `API.member.search`, `API.package.getAll`, `API.service.getAll`).
* **Service Classes (`src/services/`)**:
  * Create dedicated service modules for domain entities (e.g., `member.service.js`, `service.service.js`, `state.service.js`).
  * Encapsulate API routes inside service methods and run request/response mappings here rather than inside components.

---

## 4. Decoupled Data Layer / Models (`src/models/`)
To protect components from unexpected backend payload updates, always map request payloads and response payloads using model translators.
* **`memberModel.js`**:
  * `MemberRequestModel(form)`: Translates UI state fields (e.g., `whatsapp`, `businessName`, `state`, `gender`) into API database fields (e.g., `alterNativeMobileNumber`, `shopName`, `stateId`, `genderId`).
  * `MemberResponseModel(item)`: Translates raw database rows back to standardized UI states (e.g., formats dates, maps gender indices, resolves names).
* **`memberSearchModel.js`**:
  * `MemberSearchResponseModel(res)`: Safely processes autocomplete searches, extracting status keys (`isKycApproved`, `isActive`), parsing wallet balance floats, and structuring hierarchical parent/upline information.
* **Rules**: Do not allow raw component states to be sent directly to write APIs without running them through a `RequestModel`. Similarly, do not assign API responses directly to Redux or local states without executing a `ResponseModel`.

---

## 5. Centralized Reusable UI Components (`src/shared/components/common/`)
Before writing standard elements, verify if they already exist in the common shared directory:

1. **`PopupModal.jsx`**:
   * A premium glassmorphic alert popup supporting success, error, warning, and info notification categories.
   * Utilizes the `usePopup()` hook (`const { popup, showPopup, closePopup } = usePopup();`) for instant trigger control.
2. **`MemberSearchSelect.jsx`**:
   * A debounced autocomplete search dropdown component bound to the member database.
   * Calls `API.member.search(query)` and displays ID, Name, and Mobile. Passes the selected object to the parent via `onChange`.
3. **`RoleSelect.jsx` & `PackageSelect.jsx`**:
   * API-bound `<select>` dropdowns for roles and packages, resolving list states on mount.
4. **`QuickActionGrid.jsx`**:
   * Common admin operations dashboard grid providing buttons for Edit Profile, Add Fund, Deduct Fund, Hold/Unhold, Credit Limit, and Block/Activate.
5. **`AdminTable.jsx`**:
   * Standardized, premium table layout that includes loading grids, pagination controls, search inputs, and visual state rendering.
6. **`ExportButtons.jsx`**:
   * Unified export controls (Excel, CSV, PDF, Print, Copy). Tied automatically to active page tables.
7. **`ReceiptModal.jsx`**:
   * Transaction summary print layouts for recharges, DMT, and payout records.
8. **`ServiceSelectionGrid.jsx`**:
   * Custom checkbox grid to view and toggle multiple services assigned to packages or roles.
9. **`PopupModal.jsx`**:
   * Modal wrapper that handles backdrop filter blurs and slide-up micro-animations.

---

## 6. Redux State Management (`src/store/slices/`)
Maintain structured global states rather than abusing heavy local states.
* **`uiSlice.js`**: Tracks global states like `isLoading`, `navScrolled` (navbar shadow toggle), and `notification` (success/error alerts).
* **`memberSlice.js`**: Holds member directories, pagination indexes, search states, and registration configurations:
  * **Onboarding Wizard**: Tracks `registrationState` (i.e. `currentStep`, `form` data). Use `updateRegistrationForm` and `setRegStep` to manage stepper parameters.
* **`balanceSlice.js`**: Manages main wallet and AePS wallet balances.
* **`reportSlice.js`**: Holds transaction ledgers.

---

## 7. Mandatory Coding Conventions & Rules
1. **Separation of Concerns**:
   * **UI**: Present in `src/admin/components/` or `src/member/components/`. Contains layout markup, triggers loaders, and registers user inputs.
   * **Styling**: Contained in companion `.module.css` files. Use standard colors or theme variables.
   * **State**: Contained in Redux slices (`src/store/slices/`).
   * **APIs**: Encapsulated in services (`src/services/`).
   * **Data Translation**: Encapsulated in models (`src/models/`).
2. **Do Not Duplicate Export Operations**:
   * The app binds a global export listener on the body in App.jsx. 
   * When using export buttons, add the `.global-export-btn` class alongside the format modifier (`btn-excel`, `btn-pdf`, `btn-csv`, `btn-print`, `copy`). The listener automatically parses the nearest table ancestor, strips actions columns, and triggers file generation.
3. **No Direct HTTP Calls**:
   * Never import `axios` directly into pages or components. Always consume `httpClient` via `apiService` methods or centralized endpoints.
4. **Respect UI Guidelines**:
   * Enable responsive design on every panel.
   * Follow the multi-step onboarding wizard validations (`validateStep`) in registration.
   * Leverage transitions, card shadow structures, and premium gradients defined in `PopupModal` and headers for visual hierarchy.
