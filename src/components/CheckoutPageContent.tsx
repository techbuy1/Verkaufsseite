"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getPremiumProductById } from "@/data/premiumCatalog";
import { useShop } from "@/context/ShopContext";
import { useProductStoreOptional } from "@/context/ProductStoreContext";
import { CartOrderSummary } from "@/components/cart/CartOrderSummary";
import {
  CheckoutAccessoryUpsell,
  getSmartphoneUpsellDevices,
} from "@/components/CheckoutAccessoryUpsell";
import {
  CheckoutCustomerForm,
  EMPTY_CHECKOUT_CUSTOMER,
} from "@/components/CheckoutCustomerForm";
import { PayPalCheckoutPanel } from "@/components/PayPalCheckoutPanel";
import {
  formatPrice,
  getCartItemProductHref,
  getCartItemVariantLabel,
  getCartTotal,
  type CartItem,
} from "@/lib/cart";
import { calculateAccessoryDiscounts } from "@/lib/accessoryPricing";
import {
  emptyDeviceUpsellSelection,
  priceDeviceUpsellSelection,
  type DeviceUpsellSelectionInput,
} from "@/lib/checkoutUpsell";
import { validateCheckoutCustomer } from "@/lib/checkoutCustomer";
import { initiateCheckout } from "@/lib/checkout";
import type { CheckoutCustomerInput } from "@/lib/companySettings";

type PaymentMethod = "stripe" | "paypal";

function CheckoutLineItem({ item }: { item: CartItem }) {
  const variantLabel = getCartItemVariantLabel(item);
  const productHref = getCartItemProductHref(item);

  return (
    <div className="flex gap-4 border-b border-[#d2d2d7]/40 py-4 last:border-b-0">
      <Link href={productHref} className="shop-product-thumb relative h-16 w-16 shrink-0 rounded-[14px]">
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="64px"
          className="object-contain object-center p-1.5"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={productHref} className="text-[15px] font-semibold text-[#1d1d1f] hover:opacity-80">
          {item.brand ? `${item.brand} ${item.name}` : item.name}
        </Link>
        {variantLabel && (
          <p className="mt-0.5 text-[13px] text-[#6e6e73]">{variantLabel}</p>
        )}
        <p className="mt-1 text-[13px] text-[#6e6e73]">Menge: {item.quantity}</p>
      </div>
      <p className="shrink-0 text-[15px] font-semibold text-[#1d1d1f]">
        {formatPrice(item.price * item.quantity)}
      </p>
    </div>
  );
}

export function CheckoutPageContent() {
  const { cartItems, cartSubtotal } = useShop();
  const productStore = useProductStoreOptional();
  const [customer, setCustomer] = useState<CheckoutCustomerInput>(EMPTY_CHECKOUT_CUSTOMER);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cartNeedsReview, setCartNeedsReview] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [upsellByLine, setUpsellByLine] = useState<
    Record<string, DeviceUpsellSelectionInput>
  >({});

  const smartphoneDevices = useMemo(
    () =>
      getSmartphoneUpsellDevices(cartItems, (productId) => {
        return (
          productStore?.getProductById(productId)?.catalogCategory ??
          getPremiumProductById(productId)?.catalogCategory
        );
      }),
    [cartItems, productStore],
  );

  const upsellSelections = useMemo(
    () =>
      smartphoneDevices.map(
        (device) =>
          upsellByLine[device.lineId] ?? emptyDeviceUpsellSelection(device.lineId),
      ),
    [smartphoneDevices, upsellByLine],
  );

  const pricedUpsells = useMemo(() => {
    const rows = [];
    for (const device of smartphoneDevices) {
      const selection =
        upsellByLine[device.lineId] ?? emptyDeviceUpsellSelection(device.lineId);
      const result = priceDeviceUpsellSelection(selection, device);
      if (result.ok && result.priced) rows.push(result.priced);
    }
    return rows;
  }, [smartphoneDevices, upsellByLine]);

  const upsellTotal = pricedUpsells.reduce((sum, row) => sum + row.lineTotal, 0);

  const accessoryPricing = calculateAccessoryDiscounts(
    cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  );

  const displaySubtotal = cartSubtotal + upsellTotal;
  const displayTotal = getCartTotal(displaySubtotal, accessoryPricing.totalDiscount);

  function ensureCustomerValid(): boolean {
    const result = validateCheckoutCustomer(customer);
    if (!result.ok) {
      setCheckoutError(result.message ?? "Bitte prüfe deine Kontaktdaten und Adresse.");
      return false;
    }
    setCheckoutError(null);
    return true;
  }

  async function handleStripeCheckout() {
    if (!ensureCustomerValid()) return;
    setStatusMessage(null);
    setCartNeedsReview(false);
    setIsCheckingOut(true);

    try {
      const result = await initiateCheckout(
        cartItems,
        customer,
        upsellSelections.filter((entry) => entry.mode !== "none"),
      );
      if (!result.ok) {
        setCheckoutError(result.message);
        setCartNeedsReview(Boolean(result.cartNeedsReview));
        setIsCheckingOut(false);
      }
    } catch {
      // Netzwerk-/Laufzeitfehler — kein „nicht verfügbar", sondern technisch.
      setCheckoutError(
        "Der Checkout konnte aus einem technischen Grund nicht gestartet werden. Bitte versuche es erneut oder wähle eine andere Zahlungsmethode.",
      );
      setIsCheckingOut(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <section className="min-h-screen bg-[#f5f5f7] px-5 pb-16 pt-28 md:pt-32">
        <div className="mx-auto max-w-[720px] rounded-[24px] border border-[#d2d2d7]/40 bg-white p-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h1 className="text-[28px] font-bold text-[#1d1d1f]">Checkout</h1>
          <p className="mt-3 text-[15px] text-[#6e6e73]">Dein Warenkorb ist leer.</p>
          <Link
            href="/cart"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center btn-techbuy-primary"
          >
            Zum Warenkorb
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f5f5f7] pb-16 pt-28 md:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-8 lg:px-10">
        <div className="mb-8">
          <Link href="/cart" className="text-[14px] text-[#6e6e73] hover:text-[#1d1d1f]">
            ← Warenkorb
          </Link>
          <h1 className="mt-3 text-[32px] font-bold tracking-[-0.03em] text-[#1d1d1f] md:text-[40px]">
            Kasse
          </h1>
          <p className="mt-2 text-[14px] text-[#6e6e73]">
            Kontaktdaten, Lieferadresse und sichere Zahlung über Stripe oder PayPal.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6">
              <CheckoutCustomerForm
                value={customer}
                onChange={setCustomer}
                disabled={isCheckingOut}
              />
            </div>

            <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]">Deine Bestellung</h2>
              <div className="mt-4">
                {cartItems.map((item) => (
                  <CheckoutLineItem key={item.lineId} item={item} />
                ))}
                {pricedUpsells.map((upsell) => (
                  <div
                    key={upsell.cartLineId}
                    className="flex items-start justify-between gap-4 border-b border-[#d2d2d7]/40 py-4 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">
                        {upsell.displayName}
                      </p>
                      <ul className="mt-1 space-y-0.5 text-[13px] text-[#6e6e73]">
                        {upsell.items.map((item) => (
                          <li key={`${item.type}-${item.variant ?? "x"}`}>
                            {item.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="shrink-0 text-[15px] font-semibold text-[#1d1d1f]">
                      {formatPrice(upsell.lineTotal)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <CheckoutAccessoryUpsell
              devices={smartphoneDevices}
              selections={upsellByLine}
              onChange={(cartLineId, next) =>
                setUpsellByLine((current) => ({ ...current, [cartLineId]: next }))
              }
            />

            <div className="rounded-[24px] border border-[#d2d2d7]/40 bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] md:p-6">
              <h2 className="text-[20px] font-semibold text-[#1d1d1f]">
                Zahlungsmethode
              </h2>
              <div className="mt-4 space-y-3">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-4 py-3 transition ${
                    paymentMethod === "stripe"
                      ? "border-accent bg-[#f0f7ff]"
                      : "border-border bg-white hover:border-[#c7c7cc]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === "stripe"}
                    onChange={() => {
                      setPaymentMethod("stripe");
                      setCheckoutError(null);
                      setStatusMessage(null);
                    }}
                    className="mt-1"
                    disabled={isCheckingOut}
                  />
                  <span>
                    <span className="block text-[15px] font-semibold text-[#1d1d1f]">
                      Karte / Apple Pay / Stripe
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[#6e6e73]">
                      Sichere Zahlung über Stripe Checkout
                    </span>
                  </span>
                </label>

                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-4 py-3 transition ${
                    paymentMethod === "paypal"
                      ? "border-accent bg-[#f0f7ff]"
                      : "border-border bg-white hover:border-[#c7c7cc]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={() => {
                      setPaymentMethod("paypal");
                      setCheckoutError(null);
                      setStatusMessage(null);
                    }}
                    className="mt-1"
                    disabled={isCheckingOut}
                  />
                  <span>
                    <span className="block text-[15px] font-semibold text-[#1d1d1f]">
                      PayPal
                    </span>
                    <span className="mt-0.5 block text-[13px] text-[#6e6e73]">
                      Offizieller PayPal-Checkout
                    </span>
                  </span>
                </label>
              </div>

              {paymentMethod === "paypal" && (
                <div className="mt-5">
                  <PayPalCheckoutPanel
                    items={cartItems}
                    customer={customer}
                    upsellSelections={upsellSelections.filter(
                      (entry) => entry.mode !== "none",
                    )}
                    disabled={isCheckingOut}
                    onBeforeCreate={() => ensureCustomerValid()}
                    onError={(message) => setCheckoutError(message || null)}
                    onStatus={setStatusMessage}
                  />
                </div>
              )}

              {(checkoutError || statusMessage) && (
                <div className="mt-4 space-y-2">
                  {statusMessage && (
                    <p className="text-[13px] text-[#6e6e73]">{statusMessage}</p>
                  )}
                  {checkoutError && (
                    <p className="text-[13px] text-red-600">{checkoutError}</p>
                  )}
                  {cartNeedsReview && (
                    <Link
                      href="/cart"
                      className="inline-block text-[13px] font-medium text-[#1d1d1f] underline"
                    >
                      Warenkorb prüfen und anpassen
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <CartOrderSummary
            subtotal={displaySubtotal}
            discount={accessoryPricing.totalDiscount}
            discountLabels={accessoryPricing.labels}
            onCheckout={
              paymentMethod === "stripe" ? handleStripeCheckout : undefined
            }
            isCheckingOut={isCheckingOut}
            checkoutError={paymentMethod === "stripe" ? checkoutError : null}
            checkoutLabel="Jetzt mit Stripe bezahlen"
            className="h-fit lg:sticky lg:top-28"
            hideCheckoutButton={paymentMethod === "paypal"}
          />
        </div>
      </div>

      <p className="sr-only">Gesamtvorschau {formatPrice(displayTotal)}</p>
    </section>
  );
}
