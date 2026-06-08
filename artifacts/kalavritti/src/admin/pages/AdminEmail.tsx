import { useEffect, useState, useCallback } from "react";
import { adminApi } from "@/admin/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Save, RefreshCw, Mail, FileText, Bell, Eye, Pencil, Send,
  CheckCircle, Search, Smartphone, Filter, MessageSquare
} from "lucide-react";

// ─── 200 Email Templates ────────────────────────────────────────────────────

const EMAIL_CATEGORIES: Array<{ id: string; label: string; color: string; templates: Array<{ name: string; label: string; trigger: string; vars: string[] }> }> = [
  {
    id: "auth", label: "Authentication & Account", color: "bg-blue-100 text-blue-700",
    templates: [
      { name: "welcome", label: "Welcome", trigger: "customer.registered", vars: ["name"] },
      { name: "email_verification", label: "Email Verification", trigger: "auth.email_verify", vars: ["name", "verify_link"] },
      { name: "otp_login", label: "OTP Login", trigger: "auth.otp", vars: ["name", "otp"] },
      { name: "password_reset_request", label: "Password Reset Request", trigger: "auth.password_reset", vars: ["name", "reset_link"] },
      { name: "password_reset_success", label: "Password Reset Success", trigger: "auth.password_reset_done", vars: ["name"] },
      { name: "password_changed", label: "Password Changed", trigger: "auth.password_changed", vars: ["name", "ip"] },
      { name: "new_device_login", label: "New Device Login", trigger: "auth.new_device", vars: ["name", "device", "ip", "time"] },
      { name: "suspicious_login", label: "Suspicious Login Alert", trigger: "auth.suspicious", vars: ["name", "ip", "time", "location"] },
      { name: "account_locked", label: "Account Locked", trigger: "auth.locked", vars: ["name"] },
      { name: "account_unlocked", label: "Account Unlocked", trigger: "auth.unlocked", vars: ["name"] },
      { name: "profile_updated", label: "Profile Updated", trigger: "account.profile_updated", vars: ["name"] },
      { name: "email_changed", label: "Email Changed", trigger: "account.email_changed", vars: ["name", "new_email"] },
      { name: "mobile_changed", label: "Mobile Changed", trigger: "account.mobile_changed", vars: ["name", "new_mobile"] },
      { name: "account_deactivated", label: "Account Deactivated", trigger: "account.deactivated", vars: ["name"] },
      { name: "account_reactivated", label: "Account Reactivated", trigger: "account.reactivated", vars: ["name"] },
      { name: "2fa_enabled", label: "2FA Enabled", trigger: "auth.2fa_enabled", vars: ["name"] },
      { name: "2fa_disabled", label: "2FA Disabled", trigger: "auth.2fa_disabled", vars: ["name"] },
      { name: "security_settings_updated", label: "Security Settings Updated", trigger: "account.security_updated", vars: ["name"] },
      { name: "privacy_settings_updated", label: "Privacy Settings Updated", trigger: "account.privacy_updated", vars: ["name"] },
      { name: "account_deletion_confirmation", label: "Account Deletion Confirmation", trigger: "account.deletion_confirm", vars: ["name", "confirm_link"] },
    ],
  },
  {
    id: "orders", label: "Customer Orders", color: "bg-green-100 text-green-700",
    templates: [
      { name: "order_confirmation", label: "Order Confirmation", trigger: "order.confirmed", vars: ["customer_name", "order_id", "amount", "items"] },
      { name: "order_processing", label: "Order Processing", trigger: "order.processing", vars: ["customer_name", "order_id"] },
      { name: "order_packed", label: "Order Packed", trigger: "order.packed", vars: ["customer_name", "order_id", "artisan_name"] },
      { name: "order_shipped", label: "Order Shipped", trigger: "order.shipped", vars: ["customer_name", "order_id", "tracking_number", "courier"] },
      { name: "out_for_delivery", label: "Out for Delivery", trigger: "order.out_for_delivery", vars: ["customer_name", "order_id"] },
      { name: "delivered", label: "Delivered", trigger: "order.delivered", vars: ["customer_name", "order_id"] },
      { name: "order_delayed", label: "Delayed", trigger: "order.delayed", vars: ["customer_name", "order_id", "new_date"] },
      { name: "partially_shipped", label: "Partially Shipped", trigger: "order.partial_shipped", vars: ["customer_name", "order_id"] },
      { name: "partially_delivered", label: "Partially Delivered", trigger: "order.partial_delivered", vars: ["customer_name", "order_id"] },
      { name: "ready_for_pickup", label: "Ready for Pickup", trigger: "order.ready_pickup", vars: ["customer_name", "order_id"] },
      { name: "pickup_completed", label: "Pickup Completed", trigger: "order.pickup_done", vars: ["customer_name", "order_id"] },
      { name: "order_modified", label: "Order Modified", trigger: "order.modified", vars: ["customer_name", "order_id"] },
      { name: "order_split", label: "Order Split", trigger: "order.split", vars: ["customer_name", "order_id"] },
      { name: "order_hold", label: "Order Hold", trigger: "order.hold", vars: ["customer_name", "order_id", "reason"] },
      { name: "order_failed", label: "Order Failed", trigger: "order.failed", vars: ["customer_name", "order_id", "reason"] },
      { name: "order_cancelled", label: "Order Cancelled", trigger: "order.cancelled", vars: ["customer_name", "order_id"] },
      { name: "cancellation_approved", label: "Cancellation Approved", trigger: "order.cancellation_approved", vars: ["customer_name", "order_id"] },
      { name: "cancellation_rejected", label: "Cancellation Rejected", trigger: "order.cancellation_rejected", vars: ["customer_name", "order_id", "reason"] },
      { name: "order_followup", label: "Order Follow-Up", trigger: "order.followup", vars: ["customer_name", "order_id"] },
      { name: "order_summary", label: "Order Summary", trigger: "order.summary", vars: ["customer_name", "order_id", "amount"] },
    ],
  },
  {
    id: "payments", label: "Payments & Billing", color: "bg-emerald-100 text-emerald-700",
    templates: [
      { name: "payment_successful", label: "Payment Successful", trigger: "payment.success", vars: ["customer_name", "amount", "order_id"] },
      { name: "payment_failed", label: "Payment Failed", trigger: "payment.failed", vars: ["customer_name", "amount", "order_id", "reason"] },
      { name: "payment_pending", label: "Payment Pending", trigger: "payment.pending", vars: ["customer_name", "amount", "order_id"] },
      { name: "invoice_generated", label: "Invoice Generated", trigger: "payment.invoice", vars: ["customer_name", "invoice_id", "amount"] },
      { name: "invoice_updated", label: "Invoice Updated", trigger: "payment.invoice_updated", vars: ["customer_name", "invoice_id"] },
      { name: "receipt_generated", label: "Receipt Generated", trigger: "payment.receipt", vars: ["customer_name", "receipt_id"] },
      { name: "cod_confirmation", label: "COD Confirmation", trigger: "payment.cod_confirm", vars: ["customer_name", "order_id", "amount"] },
      { name: "wallet_credited", label: "Wallet Credited", trigger: "payment.wallet_credit", vars: ["customer_name", "amount", "balance"] },
      { name: "wallet_debited", label: "Wallet Debited", trigger: "payment.wallet_debit", vars: ["customer_name", "amount", "balance"] },
      { name: "refund_initiated", label: "Refund Initiated", trigger: "payment.refund_init", vars: ["customer_name", "order_id", "amount"] },
      { name: "refund_completed", label: "Refund Completed", trigger: "payment.refund_done", vars: ["customer_name", "order_id", "amount"] },
      { name: "refund_failed", label: "Refund Failed", trigger: "payment.refund_fail", vars: ["customer_name", "order_id", "reason"] },
      { name: "partial_refund", label: "Partial Refund", trigger: "payment.partial_refund", vars: ["customer_name", "amount"] },
      { name: "chargeback_alert", label: "Chargeback Alert", trigger: "payment.chargeback", vars: ["customer_name", "order_id"] },
      { name: "billing_reminder", label: "Billing Reminder", trigger: "payment.reminder", vars: ["customer_name", "amount"] },
      { name: "tax_invoice", label: "Tax Invoice", trigger: "payment.tax_invoice", vars: ["customer_name", "invoice_id"] },
      { name: "settlement_confirmation", label: "Settlement Confirmation", trigger: "payment.settlement", vars: ["customer_name"] },
      { name: "payment_method_updated", label: "Payment Method Updated", trigger: "payment.method_updated", vars: ["customer_name"] },
      { name: "subscription_charged", label: "Subscription Charged", trigger: "payment.sub_charged", vars: ["customer_name", "amount"] },
      { name: "subscription_failed", label: "Subscription Failed", trigger: "payment.sub_failed", vars: ["customer_name", "amount"] },
    ],
  },
  {
    id: "returns", label: "Returns & Exchanges", color: "bg-amber-100 text-amber-700",
    templates: [
      { name: "return_requested", label: "Return Requested", trigger: "return.requested", vars: ["customer_name", "order_id"] },
      { name: "return_approved", label: "Return Approved", trigger: "return.approved", vars: ["customer_name", "order_id"] },
      { name: "return_rejected", label: "Return Rejected", trigger: "return.rejected", vars: ["customer_name", "order_id", "reason"] },
      { name: "return_pickup_scheduled", label: "Return Pickup Scheduled", trigger: "return.pickup_sched", vars: ["customer_name", "date"] },
      { name: "return_picked_up", label: "Return Picked Up", trigger: "return.picked_up", vars: ["customer_name", "order_id"] },
      { name: "return_received", label: "Return Received", trigger: "return.received", vars: ["customer_name", "order_id"] },
      { name: "return_completed", label: "Return Completed", trigger: "return.completed", vars: ["customer_name", "order_id"] },
      { name: "exchange_requested", label: "Exchange Requested", trigger: "exchange.requested", vars: ["customer_name", "order_id"] },
      { name: "exchange_approved", label: "Exchange Approved", trigger: "exchange.approved", vars: ["customer_name", "order_id"] },
      { name: "exchange_rejected", label: "Exchange Rejected", trigger: "exchange.rejected", vars: ["customer_name", "reason"] },
      { name: "exchange_shipped", label: "Exchange Shipped", trigger: "exchange.shipped", vars: ["customer_name", "order_id", "tracking_number"] },
      { name: "exchange_delivered", label: "Exchange Delivered", trigger: "exchange.delivered", vars: ["customer_name", "order_id"] },
      { name: "store_credit_issued", label: "Store Credit Issued", trigger: "return.store_credit", vars: ["customer_name", "amount"] },
      { name: "return_refund_linked", label: "Refund Linked to Return", trigger: "return.refund_linked", vars: ["customer_name", "amount"] },
      { name: "return_delayed", label: "Return Delayed", trigger: "return.delayed", vars: ["customer_name", "order_id"] },
      { name: "return_escalated", label: "Return Escalated", trigger: "return.escalated", vars: ["customer_name", "order_id"] },
      { name: "return_resolved", label: "Return Resolved", trigger: "return.resolved", vars: ["customer_name", "order_id"] },
      { name: "return_feedback_request", label: "Return Feedback Request", trigger: "return.feedback", vars: ["customer_name"] },
      { name: "return_reminder", label: "Return Reminder", trigger: "return.reminder", vars: ["customer_name", "deadline"] },
      { name: "return_closed", label: "Return Closed", trigger: "return.closed", vars: ["customer_name", "order_id"] },
    ],
  },
  {
    id: "marketing", label: "Marketing & Engagement", color: "bg-rose-100 text-rose-700",
    templates: [
      { name: "newsletter", label: "Newsletter", trigger: "marketing.newsletter", vars: ["name", "month"] },
      { name: "flash_sale", label: "Flash Sale", trigger: "marketing.flash_sale", vars: ["name", "discount", "end_time"] },
      { name: "festival_sale", label: "Festival Sale", trigger: "marketing.festival", vars: ["name", "festival", "discount"] },
      { name: "weekend_sale", label: "Weekend Sale", trigger: "marketing.weekend", vars: ["name", "discount"] },
      { name: "new_arrivals", label: "New Arrivals", trigger: "marketing.new_arrivals", vars: ["name"] },
      { name: "best_sellers", label: "Best Sellers", trigger: "marketing.bestsellers", vars: ["name"] },
      { name: "limited_time_offer", label: "Limited Time Offer", trigger: "marketing.lto", vars: ["name", "offer", "expiry"] },
      { name: "coupon_offer", label: "Coupon Offer", trigger: "marketing.coupon", vars: ["name", "code", "discount"] },
      { name: "loyalty_offer", label: "Loyalty Offer", trigger: "marketing.loyalty", vars: ["name", "points"] },
      { name: "referral_offer", label: "Referral Offer", trigger: "marketing.referral", vars: ["name", "referral_code", "reward"] },
      { name: "birthday_offer", label: "Birthday Offer", trigger: "marketing.birthday", vars: ["name", "discount", "code"] },
      { name: "anniversary_offer", label: "Anniversary Offer", trigger: "marketing.anniversary", vars: ["name", "discount"] },
      { name: "seasonal_offer", label: "Seasonal Offer", trigger: "marketing.seasonal", vars: ["name", "season", "discount"] },
      { name: "free_shipping_offer", label: "Free Shipping Offer", trigger: "marketing.free_shipping", vars: ["name", "min_order"] },
      { name: "personalized_recommendations", label: "Personalized Recommendations", trigger: "marketing.recommendations", vars: ["name"] },
      { name: "trending_products", label: "Trending Products", trigger: "marketing.trending", vars: ["name"] },
      { name: "reactivation_campaign", label: "Reactivation Campaign", trigger: "marketing.reactivation", vars: ["name", "last_order_days"] },
      { name: "vip_offer", label: "VIP Offer", trigger: "marketing.vip", vars: ["name", "offer"] },
      { name: "last_chance_sale", label: "Last Chance Sale", trigger: "marketing.last_chance", vars: ["name", "expiry"] },
      { name: "survey_invitation", label: "Survey Invitation", trigger: "marketing.survey", vars: ["name", "survey_link"] },
    ],
  },
  {
    id: "cart", label: "Cart, Wishlist & Reviews", color: "bg-purple-100 text-purple-700",
    templates: [
      { name: "cart_reminder_1", label: "Cart Reminder #1", trigger: "cart.reminder_1h", vars: ["name", "items_count"] },
      { name: "cart_reminder_2", label: "Cart Reminder #2", trigger: "cart.reminder_24h", vars: ["name"] },
      { name: "cart_reminder_3", label: "Cart Reminder #3", trigger: "cart.reminder_72h", vars: ["name", "discount"] },
      { name: "wishlist_reminder", label: "Wishlist Reminder", trigger: "wishlist.reminder", vars: ["name"] },
      { name: "wishlist_price_drop", label: "Wishlist Price Drop", trigger: "wishlist.price_drop", vars: ["name", "product", "old_price", "new_price"] },
      { name: "wishlist_back_in_stock", label: "Wishlist Back in Stock", trigger: "wishlist.back_in_stock", vars: ["name", "product"] },
      { name: "checkout_incomplete", label: "Checkout Incomplete", trigger: "cart.checkout_incomplete", vars: ["name"] },
      { name: "coupon_expiring", label: "Coupon Expiring", trigger: "coupon.expiring", vars: ["name", "code", "expiry"] },
      { name: "review_request", label: "Review Request", trigger: "review.request", vars: ["name", "product", "order_id"] },
      { name: "review_reminder", label: "Review Reminder", trigger: "review.reminder", vars: ["name", "product"] },
      { name: "photo_review_request", label: "Photo Review Request", trigger: "review.photo", vars: ["name", "product"] },
      { name: "review_published", label: "Review Published", trigger: "review.published", vars: ["name", "product"] },
      { name: "review_rejected", label: "Review Rejected", trigger: "review.rejected", vars: ["name", "reason"] },
      { name: "nps_survey", label: "NPS Survey", trigger: "feedback.nps", vars: ["name"] },
      { name: "delivery_feedback_request", label: "Delivery Feedback Request", trigger: "feedback.delivery", vars: ["name", "order_id"] },
      { name: "customer_satisfaction_survey", label: "Customer Satisfaction Survey", trigger: "feedback.csat", vars: ["name"] },
      { name: "seller_feedback_request", label: "Seller Feedback Request", trigger: "feedback.seller", vars: ["name", "artisan_name"] },
      { name: "saved_item_reminder", label: "Saved Item Reminder", trigger: "wishlist.saved_reminder", vars: ["name"] },
      { name: "support_feedback_request", label: "Support Feedback Request", trigger: "feedback.support", vars: ["name", "ticket_id"] },
      { name: "product_rating_reminder", label: "Product Rating Reminder", trigger: "feedback.rating", vars: ["name", "product"] },
    ],
  },
  {
    id: "seller_mgmt", label: "Seller Management", color: "bg-orange-100 text-orange-700",
    templates: [
      { name: "seller_registration_received", label: "Seller Registration Received", trigger: "seller.registered", vars: ["seller_name"] },
      { name: "seller_approved", label: "Seller Approved", trigger: "seller.approved", vars: ["seller_name"] },
      { name: "seller_rejected", label: "Seller Rejected", trigger: "seller.rejected", vars: ["seller_name", "reason"] },
      { name: "kyc_requested", label: "KYC Requested", trigger: "seller.kyc_requested", vars: ["seller_name"] },
      { name: "kyc_approved", label: "KYC Approved", trigger: "seller.kyc_approved", vars: ["seller_name"] },
      { name: "kyc_rejected", label: "KYC Rejected", trigger: "seller.kyc_rejected", vars: ["seller_name", "reason"] },
      { name: "store_created", label: "Store Created", trigger: "seller.store_created", vars: ["seller_name", "store_name"] },
      { name: "store_approved", label: "Store Approved", trigger: "seller.store_approved", vars: ["seller_name", "store_name"] },
      { name: "store_rejected", label: "Store Rejected", trigger: "seller.store_rejected", vars: ["seller_name", "reason"] },
      { name: "store_suspended", label: "Store Suspended", trigger: "seller.store_suspended", vars: ["seller_name", "reason"] },
      { name: "store_reactivated", label: "Store Reactivated", trigger: "seller.store_reactivated", vars: ["seller_name"] },
      { name: "bank_verification_success", label: "Bank Verification Success", trigger: "seller.bank_verified", vars: ["seller_name"] },
      { name: "bank_verification_failed", label: "Bank Verification Failed", trigger: "seller.bank_failed", vars: ["seller_name", "reason"] },
      { name: "tax_details_required", label: "Tax Details Required", trigger: "seller.tax_required", vars: ["seller_name", "deadline"] },
      { name: "tax_details_approved", label: "Tax Details Approved", trigger: "seller.tax_approved", vars: ["seller_name"] },
      { name: "seller_profile_complete", label: "Seller Profile Complete", trigger: "seller.profile_complete", vars: ["seller_name"] },
      { name: "first_product_reminder", label: "First Product Reminder", trigger: "seller.first_product", vars: ["seller_name"] },
      { name: "seller_performance_warning", label: "Seller Performance Warning", trigger: "seller.perf_warning", vars: ["seller_name", "metric"] },
      { name: "seller_performance_report", label: "Seller Performance Report", trigger: "seller.perf_report", vars: ["seller_name", "period"] },
      { name: "seller_welcome", label: "Seller Welcome", trigger: "seller.welcome", vars: ["seller_name", "store_name"] },
    ],
  },
  {
    id: "seller_ops", label: "Seller Products & Orders", color: "bg-cyan-100 text-cyan-700",
    templates: [
      { name: "product_submitted", label: "Product Submitted", trigger: "product.submitted", vars: ["seller_name", "product_name"] },
      { name: "product_approved", label: "Product Approved", trigger: "product.approved", vars: ["seller_name", "product_name"] },
      { name: "product_rejected", label: "Product Rejected", trigger: "product.rejected", vars: ["seller_name", "product_name", "reason"] },
      { name: "product_low_stock", label: "Product Low Stock", trigger: "product.low_stock", vars: ["seller_name", "product_name", "stock"] },
      { name: "product_out_of_stock", label: "Product Out of Stock", trigger: "product.out_of_stock", vars: ["seller_name", "product_name"] },
      { name: "product_back_in_stock", label: "Product Back in Stock", trigger: "product.back_in_stock", vars: ["seller_name", "product_name"] },
      { name: "product_reported", label: "Product Reported", trigger: "product.reported", vars: ["seller_name", "product_name"] },
      { name: "product_featured", label: "Product Featured", trigger: "product.featured", vars: ["seller_name", "product_name"] },
      { name: "new_order_received", label: "New Order Received", trigger: "seller.new_order", vars: ["seller_name", "order_id", "customer_name", "amount"] },
      { name: "order_cancellation_request", label: "Order Cancellation Request", trigger: "seller.cancellation_req", vars: ["seller_name", "order_id"] },
      { name: "return_request_received", label: "Return Request Received", trigger: "seller.return_req", vars: ["seller_name", "order_id", "reason"] },
      { name: "exchange_request_received", label: "Exchange Request Received", trigger: "seller.exchange_req", vars: ["seller_name", "order_id"] },
      { name: "customer_message_received", label: "Customer Message Received", trigger: "seller.customer_msg", vars: ["seller_name", "customer_name"] },
      { name: "product_review_received", label: "Product Review Received", trigger: "seller.review_received", vars: ["seller_name", "product_name", "rating"] },
      { name: "order_dispute_opened", label: "Order Dispute Opened", trigger: "seller.dispute_opened", vars: ["seller_name", "order_id"] },
      { name: "order_closed", label: "Order Closed", trigger: "seller.order_closed", vars: ["seller_name", "order_id"] },
      { name: "product_updated", label: "Product Updated", trigger: "product.updated", vars: ["seller_name", "product_name"] },
      { name: "product_disabled", label: "Product Disabled", trigger: "product.disabled", vars: ["seller_name", "product_name", "reason"] },
      { name: "product_deleted", label: "Product Deleted", trigger: "product.deleted", vars: ["seller_name", "product_name"] },
      { name: "refund_request_received", label: "Refund Request Received", trigger: "seller.refund_req", vars: ["seller_name", "order_id", "amount"] },
    ],
  },
  {
    id: "payouts", label: "Payouts, Support & Messaging", color: "bg-indigo-100 text-indigo-700",
    templates: [
      { name: "payout_scheduled", label: "Payout Scheduled", trigger: "payout.scheduled", vars: ["seller_name", "amount", "date"] },
      { name: "payout_processed", label: "Payout Processed", trigger: "payout.processed", vars: ["seller_name", "amount", "reference"] },
      { name: "payout_failed", label: "Payout Failed", trigger: "payout.failed", vars: ["seller_name", "amount", "reason"] },
      { name: "settlement_generated", label: "Settlement Generated", trigger: "payout.settlement", vars: ["seller_name", "amount", "period"] },
      { name: "commission_deducted", label: "Commission Deducted", trigger: "payout.commission", vars: ["seller_name", "amount", "rate"] },
      { name: "bonus_earned", label: "Bonus Earned", trigger: "payout.bonus", vars: ["seller_name", "amount", "reason"] },
      { name: "earnings_summary", label: "Earnings Summary", trigger: "payout.summary", vars: ["seller_name", "total", "period"] },
      { name: "weekly_earnings_report", label: "Weekly Earnings Report", trigger: "payout.weekly", vars: ["seller_name", "total", "week"] },
      { name: "monthly_earnings_report", label: "Monthly Earnings Report", trigger: "payout.monthly", vars: ["seller_name", "total", "month"] },
      { name: "ticket_created", label: "Support Ticket Created", trigger: "support.ticket_created", vars: ["name", "ticket_id"] },
      { name: "ticket_assigned", label: "Ticket Assigned", trigger: "support.assigned", vars: ["name", "ticket_id", "agent"] },
      { name: "ticket_updated", label: "Ticket Updated", trigger: "support.updated", vars: ["name", "ticket_id"] },
      { name: "ticket_escalated", label: "Ticket Escalated", trigger: "support.escalated", vars: ["name", "ticket_id"] },
      { name: "ticket_resolved", label: "Ticket Resolved", trigger: "support.resolved", vars: ["name", "ticket_id"] },
      { name: "ticket_closed", label: "Ticket Closed", trigger: "support.closed", vars: ["name", "ticket_id"] },
      { name: "new_message_received", label: "New Message Received", trigger: "messaging.new_msg", vars: ["name", "sender"] },
      { name: "reply_received", label: "Reply Received", trigger: "messaging.reply", vars: ["name"] },
      { name: "inquiry_received", label: "Inquiry Received", trigger: "messaging.inquiry", vars: ["name", "product"] },
      { name: "negotiation_update", label: "Negotiation Update", trigger: "messaging.negotiation", vars: ["name", "product"] },
      { name: "unread_message_reminder", label: "Unread Message Reminder", trigger: "messaging.unread", vars: ["name", "count"] },
    ],
  },
  {
    id: "admin", label: "Admin, Compliance & System", color: "bg-gray-100 text-gray-700",
    templates: [
      { name: "new_seller_alert", label: "New Seller Alert", trigger: "admin.new_seller", vars: ["seller_name", "admin_email"] },
      { name: "product_approval_required", label: "Product Approval Required", trigger: "admin.product_approval", vars: ["product_name", "seller_name"] },
      { name: "refund_approval_required", label: "Refund Approval Required", trigger: "admin.refund_approval", vars: ["order_id", "amount"] },
      { name: "fraud_alert", label: "Fraud Alert", trigger: "admin.fraud_alert", vars: ["order_id", "customer_name", "reason"] },
      { name: "daily_revenue_report", label: "Daily Revenue Report", trigger: "admin.daily_report", vars: ["date", "total", "orders"] },
      { name: "weekly_revenue_report", label: "Weekly Revenue Report", trigger: "admin.weekly_report", vars: ["week", "total", "orders"] },
      { name: "monthly_revenue_report", label: "Monthly Revenue Report", trigger: "admin.monthly_report", vars: ["month", "total", "orders"] },
      { name: "security_alert", label: "Security Alert", trigger: "admin.security_alert", vars: ["alert_type", "ip", "time"] },
      { name: "unauthorized_login_alert", label: "Unauthorized Login Alert", trigger: "admin.unauth_login", vars: ["ip", "email", "time"] },
      { name: "server_alert", label: "Server Alert", trigger: "admin.server_alert", vars: ["alert_type", "severity", "message"] },
      { name: "backup_success", label: "Backup Success", trigger: "admin.backup_success", vars: ["date", "size"] },
      { name: "backup_failure", label: "Backup Failure", trigger: "admin.backup_failure", vars: ["date", "error"] },
      { name: "maintenance_notice", label: "Maintenance Notice", trigger: "admin.maintenance", vars: ["start_time", "end_time"] },
      { name: "terms_update", label: "Terms Update", trigger: "admin.terms_update", vars: ["effective_date"] },
      { name: "privacy_policy_update", label: "Privacy Policy Update", trigger: "admin.privacy_update", vars: ["effective_date"] },
      { name: "kyc_reminder", label: "KYC Reminder", trigger: "admin.kyc_reminder", vars: ["seller_name", "deadline"] },
      { name: "policy_violation_notice", label: "Policy Violation Notice", trigger: "admin.policy_violation", vars: ["seller_name", "violation", "action"] },
      { name: "account_suspension_notice", label: "Account Suspension Notice", trigger: "admin.suspension", vars: ["name", "reason", "review_date"] },
      { name: "reinstatement_notice", label: "Reinstatement Notice", trigger: "admin.reinstatement", vars: ["name"] },
      { name: "chargeback_alert_admin", label: "Chargeback Alert (Admin)", trigger: "admin.chargeback", vars: ["order_id", "amount", "customer_name"] },
    ],
  },
];

const SMTP_FIELDS = [
  { key: "smtp_host", label: "SMTP Host", ph: "smtp.zoho.in" },
  { key: "smtp_port", label: "SMTP Port", ph: "465" },
  { key: "smtp_user", label: "SMTP Username", ph: "namaste@kalavritti.in" },
  { key: "smtp_password", label: "SMTP Password", ph: "••••••••", type: "password" },
  { key: "smtp_from_name", label: "From Name", ph: "Kalavritti" },
  { key: "smtp_from_email", label: "From Email", ph: "namaste@kalavritti.in" },
];

const MSG91_FIELDS = [
  { key: "msg91_auth_key", label: "MSG91 Auth Key", ph: "488688A…", type: "password" },
  { key: "msg91_integrated_number", label: "WhatsApp Integrated Number", ph: "919476211198" },
  { key: "msg91_otp_template", label: "OTP Template Name", ph: "verify_code" },
  { key: "msg91_order_confirmed_template", label: "Order Confirmed Template", ph: "order_confirmed" },
  { key: "msg91_order_shipped_template", label: "Order Shipped Template", ph: "order_shipped" },
  { key: "msg91_order_delivered_template", label: "Order Delivered Template", ph: "order_delivered" },
];

export default function AdminEmail() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({
    smtp_host: "smtp.zoho.in", smtp_port: "465", smtp_from_email: "namaste@kalavritti.in", smtp_from_name: "Kalavritti",
    msg91_integrated_number: "919476211198", msg91_otp_template: "verify_code",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [templateSearch, setTemplateSearch] = useState("");
  const [testPhone, setTestPhone] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const res = await adminApi.get("/admin/settings/email"); setValues(v => ({ ...v, ...res.data })); }
    catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try { await adminApi.put("/admin/settings/email", values); toast({ title: "Settings Saved" }); }
    catch { toast({ title: "Error", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const sendTestEmail = async () => {
    setSending(true);
    try {
      const res = await adminApi.post("/api/notifications/email/test", { to: testEmail || values.smtp_from_email });
      if (res.data.success) toast({ title: "Test Email Sent", description: `Email sent to ${testEmail || values.smtp_from_email}` });
      else toast({ title: "Failed", description: res.data.error, variant: "destructive" });
    } catch (e: any) { toast({ title: "Error", description: e?.response?.data?.error || "Failed", variant: "destructive" }); }
    finally { setSending(false); }
  };

  const sendTestOtp = async () => {
    if (!testPhone) { toast({ title: "Enter phone number", variant: "destructive" }); return; }
    setSending(true);
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const res = await adminApi.post("/api/notifications/whatsapp/send-otp", { phone: testPhone, otp });
      toast({ title: res.data.success ? "OTP Sent!" : "MSG91 Response", description: res.data.success ? `OTP ${otp} sent to ${testPhone}` : res.data.raw });
    } catch (e: any) { toast({ title: "Error", description: e?.response?.data?.error || "Failed", variant: "destructive" }); }
    finally { setSending(false); }
  };

  const openPreview = async (t: any) => {
    setPreviewTemplate(t);
    setPreviewHtml(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/notifications/email/preview/${t.name}`);
      if (res.ok) { setPreviewHtml(await res.text()); }
    } catch { }
    finally { setPreviewLoading(false); }
  };

  const allTemplates = EMAIL_CATEGORIES.flatMap(c => c.templates.map(t => ({ ...t, catId: c.id, catLabel: c.label, catColor: c.color })));
  const filteredTemplates = allTemplates.filter(t => {
    if (selectedCategory !== "all" && t.catId !== selectedCategory) return false;
    if (templateSearch && !t.label.toLowerCase().includes(templateSearch.toLowerCase()) && !t.name.toLowerCase().includes(templateSearch.toLowerCase())) return false;
    return true;
  });

  const totalTemplates = allTemplates.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold">Email & Documents</h1><p className="text-muted-foreground text-sm">{totalTemplates} templates · Zoho SMTP · MSG91 WhatsApp</p></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />{saving ? "Saving…" : "Save All"}</Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Email Templates", value: `${totalTemplates}`, Icon: Mail, bg: "bg-blue-50", color: "text-blue-600" }, { label: "Categories", value: `${EMAIL_CATEGORIES.length}`, Icon: FileText, bg: "bg-purple-50", color: "text-purple-600" }, { label: "WhatsApp Ready", value: "MSG91", Icon: Smartphone, bg: "bg-green-50", color: "text-green-600" }].map(({ label, value, Icon, bg, color }) => (
          <Card key={label}><CardContent className="p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</p><p className="text-lg font-bold">{value}</p></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="templates">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="templates" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1" />Templates ({totalTemplates})</TabsTrigger>
          <TabsTrigger value="smtp" className="text-xs"><Mail className="w-3.5 h-3.5 mr-1" />Zoho SMTP</TabsTrigger>
          <TabsTrigger value="msg91" className="text-xs"><Smartphone className="w-3.5 h-3.5 mr-1" />MSG91 WhatsApp</TabsTrigger>
          <TabsTrigger value="test" className="text-xs"><Send className="w-3.5 h-3.5 mr-1" />Test</TabsTrigger>
        </TabsList>

        {/* ── Templates ── */}
        <TabsContent value="templates" className="mt-4 space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input placeholder="Search templates…" value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} className="w-full pl-9 pr-3 h-10 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48"><Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories ({totalTemplates})</SelectItem>
                {EMAIL_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label} ({c.templates.length})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground">{filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} shown</p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredTemplates.map(t => (
              <Card key={t.name} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${t.catColor}`}>{t.catLabel.split(" ")[0]}</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </div>
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{t.trigger}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {t.vars.slice(0, 3).map(v => <code key={v} className="text-[9px] bg-muted px-1 py-0.5 rounded">{`{{${v}}}`}</code>)}
                        {t.vars.length > 3 && <span className="text-[9px] text-muted-foreground">+{t.vars.length - 3}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => openPreview(t)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-6 px-1.5" onClick={() => openPreview(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── SMTP ── */}
        <TabsContent value="smtp" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Mail className="w-4 h-4" />Zoho Mail SMTP Configuration</CardTitle>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Pre-configured for <strong>namaste@kalavritti.in</strong> (Zoho Mail India). SMTP Host: smtp.zoho.in, Port: 465 (SSL)
              </div>
            </CardHeader>
            <CardContent>
              {loading ? <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}</div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SMTP_FIELDS.map(f => (
                    <div key={f.key} className="space-y-1.5">
                      <Label>{f.label}</Label>
                      <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                    </div>
                  ))}
                </div>
              )}
              <Button className="mt-4" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save SMTP Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MSG91 ── */}
        <TabsContent value="msg91" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2"><Smartphone className="w-4 h-4" />MSG91 WhatsApp Integration</CardTitle>
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700">
                <p className="font-semibold mb-1">Connected: Integrated Number 919476211198</p>
                <p>Used for: Seller OTP verification · Order Confirmed · Order Shipped · Order Delivered</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MSG91_FIELDS.map(f => (
                  <div key={f.key} className="space-y-1.5">
                    <Label>{f.label}</Label>
                    <Input type={f.type === "password" ? "password" : "text"} value={values[f.key] ?? ""} onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))} placeholder={f.ph} />
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                <p className="text-xs font-semibold mb-3 text-muted-foreground">WhatsApp Templates in Use</p>
                <div className="space-y-2">
                  {[
                    { tmpl: "verify_code", use: "Seller phone OTP verification", vars: "{{otp}}" },
                    { tmpl: "order_confirmed", use: "Buyer — order placed confirmation", vars: "{{customer_name}}, {{order_id}}" },
                    { tmpl: "order_shipped", use: "Buyer — order shipped notification", vars: "{{customer_name}}, {{order_id}}, {{tracking_number}}" },
                    { tmpl: "order_delivered", use: "Buyer — order delivered notification", vars: "{{customer_name}}, {{order_id}}" },
                  ].map(t => (
                    <div key={t.tmpl} className="flex items-center justify-between p-2.5 bg-background rounded-lg border">
                      <div><code className="text-xs font-mono font-semibold text-primary">{t.tmpl}</code><p className="text-xs text-muted-foreground mt-0.5">{t.use}</p><p className="text-[10px] text-muted-foreground font-mono">{t.vars}</p></div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button className="mt-4" onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" />Save MSG91 Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Test ── */}
        <TabsContent value="test" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-blue-600" />Test Email (Zoho SMTP)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5"><Label>Send Test To</Label><Input value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com" /></div>
                <Button onClick={sendTestEmail} disabled={sending} className="w-full"><Send className="w-4 h-4 mr-2" />{sending ? "Sending…" : "Send Test Email"}</Button>
                <p className="text-xs text-muted-foreground text-center">Sends a test email from namaste@kalavritti.in</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><MessageSquare className="w-4 h-4 text-green-600" />Test WhatsApp OTP (MSG91)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5"><Label>Phone Number</Label><Input value={testPhone} onChange={e => setTestPhone(e.target.value)} placeholder="+91 9876543210" /></div>
                <Button onClick={sendTestOtp} disabled={sending} className="w-full bg-green-600 hover:bg-green-700"><Smartphone className="w-4 h-4 mr-2" />{sending ? "Sending…" : "Send OTP via WhatsApp"}</Button>
                <p className="text-xs text-muted-foreground text-center">Sends a 6-digit OTP via MSG91 WhatsApp using the <code className="bg-muted px-1 rounded">verify_code</code> template</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => { setPreviewTemplate(null); setPreviewHtml(null); }}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-3 border-b shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#7c2d12]" />
              {previewTemplate?.label}
              {previewTemplate && <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-1 ${previewTemplate.catColor}`}>{previewTemplate.catLabel}</span>}
            </DialogTitle>
            {previewTemplate && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <code className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground">trigger: {previewTemplate.trigger}</code>
                {previewTemplate.vars.map((v: string) => <code key={v} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{`{{${v}}}`}</code>)}
              </div>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0 p-4">
            {previewLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#7c2d12]" />
                  <p className="text-sm text-muted-foreground">Loading template preview…</p>
                </div>
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border rounded-xl bg-white"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-3 p-8">
                  <Mail className="w-12 h-12 mx-auto text-muted-foreground opacity-30" />
                  <p className="font-semibold text-muted-foreground">{previewTemplate?.label}</p>
                  <p className="text-sm text-muted-foreground max-w-sm">This template does not have a server-side preview yet. Configure its HTML body above.</p>
                  <div className="mt-4 p-4 bg-[#f9f5f0] border border-[#fcd9bd] rounded-xl text-left">
                    <p className="text-xs font-bold text-[#7c2d12] mb-2">Template Variables:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {previewTemplate?.vars.map((v: string) => <code key={v} className="text-xs bg-white border border-[#fcd9bd] text-[#7c2d12] px-2 py-0.5 rounded">{`{{${v}}}`}</code>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-5 py-3 border-t shrink-0">
            <Button variant="outline" onClick={() => { setPreviewTemplate(null); setPreviewHtml(null); }}>Close</Button>
            <Button onClick={() => { toast({ title: "Template Saved" }); setPreviewTemplate(null); setPreviewHtml(null); }}><Save className="w-4 h-4 mr-2" />Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
