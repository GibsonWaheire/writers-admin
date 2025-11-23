# Admin Action Notifications System

## Overview
Comprehensive notification system ensuring writers are always informed of all admin actions that affect their work, maintaining system integrity and transparency.

## 🎯 Key Features

### 1. **Sidebar Badge Alerts**
- **Assigned Orders**: Shows count badge (e.g., "Assigned Orders (3)")
- **Revisions**: Shows count badge for orders requiring revision
- **Rejected Orders**: Shows count badge for rejected orders
- Badges are red and prominently displayed next to menu items

### 2. **Toast Popup Notifications**
- **Revision Requests**: Yellow warning toast at top of screen
  - Shows order title and revision explanation
  - Duration: 10 seconds
  - Appears immediately when admin requests revision
  
- **Order Rejections**: Red error toast at top of screen
  - Shows order title and rejection reason
  - Duration: 8 seconds
  - Appears immediately when admin rejects order

- **Order Assignments**: Green success toast
  - Shows when order is assigned (direct or bid approval)
  - Duration: 6 seconds

- **Order Updates**: Yellow warning toast
  - Shows when admin changes order details (price, deadline, etc.)
  - Duration: 8 seconds

### 3. **Admin Action Tracking**
All admin actions that affect writers are tracked and notified:

#### **Order Changes**
- **Price Changes**: Writer notified when order price is modified
- **Deadline Changes**: Writer notified when deadline is updated
- **Page Count Changes**: Writer notified when page count changes
- **Title/Description Changes**: Writer notified when order details change
- **Requirements Updates**: Writer notified when requirements are modified

#### **Order Status Changes**
- **Revision Request**: Immediate toast + notification
- **Order Rejection**: Immediate toast + notification
- **Order Assignment**: Toast notification
- **Order Approval**: Notification (existing)

#### **Order Deletion**
- **Attempted Deletion**: Writer notified if admin tries to delete assigned order
- **Prevention**: System prevents deletion of assigned orders
- **Notification**: Urgent notification sent to writer

## 📋 Implementation Details

### Sidebar Badges
**File**: `client/src/components/Sidebar.tsx`
- Calculates counts for: `activeOrders`, `revisionOrders`, `rejectedOrders`
- Displays red badges next to menu items when count > 0
- Updates in real-time as orders change

### Toast Notifications
**File**: `client/src/contexts/OrderContext.tsx`
- Integrated `useToast` hook
- Toast notifications triggered for:
  - `request_revision`: Warning toast (10s)
  - `reject`: Error toast (8s)
  - `assign`: Success toast (6s)
  - `approve_bid`: Success toast (6s)
  - `updateOrder`: Warning toast (8s) for important changes

### Notification System
**File**: `client/src/contexts/OrderContext.tsx`
- Uses `NotificationContext` for persistent notifications
- Notifications sent for:
  - Order updates (price, deadline, details)
  - Order deletions (attempted)
  - All status changes affecting writers

### Order Update Tracking
**File**: `client/src/contexts/OrderContext.tsx` - `updateOrder` function
- Tracks all changes to order
- Identifies "important changes" that writers need to know:
  - Price changes (price, priceKES, totalPriceKES)
  - Deadline changes
  - Page count changes
  - Title/description/requirements changes
- Sends notification + toast for important changes
- Stores change history in `lastAdminEdit` field

### Order Deletion Protection
**File**: `client/src/contexts/OrderContext.tsx` - `deleteOrder` function
- Prevents deletion of assigned orders
- Sends urgent notification to writer if deletion attempted
- Shows error toast to writer
- Throws error to prevent deletion

## 🔔 Notification Types

### Toast Notifications (Popup)
1. **Revision Required** (Warning - Yellow)
   - Trigger: Admin requests revision
   - Message: Order title + revision explanation
   - Duration: 10 seconds

2. **Order Rejected** (Error - Red)
   - Trigger: Admin rejects order
   - Message: Order title + rejection reason
   - Duration: 8 seconds

3. **Order Assigned** (Success - Green)
   - Trigger: Admin assigns order or approves bid
   - Message: Order title
   - Duration: 6 seconds

4. **Order Updated** (Warning - Yellow)
   - Trigger: Admin changes important order details
   - Message: Order title + change summary
   - Duration: 8 seconds

### Persistent Notifications
1. **Order Updated**
   - Type: `order_updated`
   - Priority: High
   - Action: View Order

2. **Order Deleted**
   - Type: `order_deleted`
   - Priority: Urgent
   - Action: View Orders

3. **Revision Required**
   - Type: `revision`
   - Priority: High
   - Action: View Revision

4. **Order Rejected**
   - Type: `order_rejected`
   - Priority: High
   - Action: View Details

## 🎨 UI/UX Features

### Sidebar Badges
- Red badges with white text
- Positioned on the right side of menu items
- Only shown when count > 0
- Updates automatically

### Toast Popups
- Fixed position: Top-right corner
- Slide-in animation
- Color-coded by type:
  - Green: Success (assignments)
  - Yellow: Warning (revisions, updates)
  - Red: Error (rejections, deletions)
- Auto-dismiss after duration
- Manual close button

## 🔄 Workflow Examples

### Admin Requests Revision
1. Admin clicks "Request Revision" on order
2. Writer immediately sees:
   - Yellow toast popup at top: "Revision Required ⚠️"
   - Sidebar badge updates: "Revisions (1)"
   - Notification added to notification center
3. Writer can click toast or sidebar to view revision

### Admin Rejects Order
1. Admin clicks "Reject" on order
2. Writer immediately sees:
   - Red toast popup: "Order Rejected ❌"
   - Sidebar badge updates: "Rejected (1)"
   - Notification added
3. Writer can view rejection reason

### Admin Changes Order Price
1. Admin updates order price
2. Writer immediately sees:
   - Yellow toast: "Order Updated by Admin ⚠️"
   - Notification: "Price changed: KES X → KES Y"
3. Writer can view full change details

### Admin Tries to Delete Assigned Order
1. Admin attempts to delete order
2. System prevents deletion
3. Writer immediately sees:
   - Red toast: "Order Deleted ❌"
   - Urgent notification: "Order deleted by admin"
4. System throws error, order not deleted

## ✅ Benefits

1. **Transparency**: Writers always know what admin is doing
2. **Real-time Updates**: Immediate notifications for critical actions
3. **System Integrity**: Prevents unauthorized changes
4. **Accountability**: All admin actions are tracked and notified
5. **User Experience**: Clear, visible alerts for important events

## 📝 Files Modified

- `client/src/components/Sidebar.tsx` - Added badge counts
- `client/src/contexts/OrderContext.tsx` - Added toast notifications and action tracking
- `client/src/contexts/ToastContext.tsx` - Toast system (already existed)

## 🚀 Usage

### For Writers
- Check sidebar badges for pending items
- Watch for toast popups for urgent notifications
- Review notification center for all updates
- All admin actions affecting your orders are visible

### For Admins
- All actions are automatically tracked
- Writers are automatically notified
- System prevents deletion of assigned orders
- Change history is stored in `lastAdminEdit` field

