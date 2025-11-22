# Feature Requirements & Implementation Plan

## 📋 TODO List

### Priority 1: Core Order Management
- [ ] **Reassigned Orders → Available**: When order is reassigned, it should go to "Available" status and appear in available orders list
- [ ] **12-Hour Reassignment Rule**: Orders with <12 hours remaining cannot be reassigned (add validation)
- [ ] **Reassigned Orders History**: Create page/section showing past reassignments with details

### Priority 2: Financial & Earnings
- [ ] **Average Earnings Source**: Investigate where average earnings comes from (currently from `getWriterFinancials` → `averageOrderValue`)
- [ ] **Wallet Sync**: Wallet should sync when order is approved - update balance automatically
- [ ] **Balance Breakdown**: Show balance for:
  - Approved orders (ready for withdrawal)
  - Unapproved orders (pending payment)
  - Pending review orders
- [ ] **Writer Invoice Creation**: Writers should be able to create invoices and submit for admin review

### Priority 3: File Upload & Submissions
- [ ] **File Upload on Submission**: When writer submits work, allow upload of:
  - Word documents (.doc, .docx)
  - PDF files (.pdf)
  - PowerPoint (.ppt, .pptx)
  - Excel (.xls, .xlsx)
  - CSV files (.csv)
  - Other formats as needed
- [ ] **Intuitive Upload UI**: Make file upload interface user-friendly with drag-and-drop

### Priority 4: Revisions System
- [ ] **Revision Explanation**: When admin requests revision, require explanation of what needs to be revised
- [ ] **Revision Score System**: 
  - Start at 10/10 for each order
  - Reduce score with each admin review/revision request
  - Display current revision score

### Priority 5: Messages System
- [ ] **Order-Specific Messages**: Messages must be associated with specific order numbers
- [ ] **Message Functionality**: Ensure messages work properly and are linked to orders

### Priority 6: POD Orders
- [ ] **POD Orders Visibility**: Ensure POD orders are shown and accessible in writer dashboard
- [ ] **POD History**: Track and display POD order history

### Priority 7: Tabs & UI
- [ ] **All Tabs Working**: Verify and fix all tabs (Details, Requirements, Messages, Files) in OrderViewModal
- [ ] **Modal Functionality**: Ensure all modals work correctly

### Priority 8: Data & History
- [ ] **Remove Demo Data**: Remove all demo/mock data
- [ ] **Transaction History**: Ensure transaction history works and displays correctly
- [ ] **Withdrawal History**: Track and display withdrawal requests and history
- [ ] **POD History**: Complete POD order history tracking

### Priority 9: Testing & Verification
- [ ] **End-to-End Testing**: Test all functionality works correctly
- [ ] **Data Integrity**: Ensure all data flows correctly between frontend and backend

## 🔍 Current Status

### Average Earnings Calculation
Currently calculated in `FinancialContext.tsx`:
- `averageOrderValue = totalEarned / completedOrders`
- Comes from `getWriterFinancials()` function
- Based on completed orders only

### Reassignment Flow
Currently in `OrderContext.tsx`:
- `make_available` action sets status to "Available"
- Clears `writerId` and `assignedWriter`
- Sets `reassignedAt` timestamp
- **Issue**: May not be appearing in available orders list properly

## 🎯 Implementation Order

1. **Fix Reassignment** (Priority 1)
2. **Add 12-Hour Validation** (Priority 1)
3. **File Upload System** (Priority 3)
4. **Revision System** (Priority 4)
5. **Messages Fix** (Priority 5)
6. **Wallet Sync** (Priority 2)
7. **Invoice Creation** (Priority 2)
8. **History Pages** (Priority 1, 6, 8)
9. **Remove Demo Data** (Priority 8)
10. **Final Testing** (Priority 9)

