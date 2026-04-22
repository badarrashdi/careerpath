import { getUpstoxConfig } from "@/lib/trading/config";

interface PlaceOrderPayload {
  quantity: number;
  product: "I" | "D";
  validity: "DAY";
  price: number;
  tag: string;
  instrument_token: string;
  order_type: "LIMIT" | "MARKET";
  transaction_type: "BUY" | "SELL";
}

export class UpstoxClient {
  private config = getUpstoxConfig();

  private headers() {
    return {
      Authorization: `Bearer ${this.config.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  getAuthorizationUrl(state = "trade_session"): string {
    const qp = new URLSearchParams({
      client_id: this.config.apiKey,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      state,
    });

    return `https://api-v2.upstox.com/login/authorization/dialog?${qp.toString()}`;
  }

  async getMarketDataFeedAuthorizedUrl() {
    const res = await fetch(`${this.config.baseUrl}/v2/feed/market-data-feed/authorize`, {
      method: "GET",
      headers: this.headers(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`upstox_market_feed_authorize_failed_${res.status}`);
    }

    return res.json();
  }

  async placeOrder(payload: PlaceOrderPayload) {
    const res = await fetch(`${this.config.baseUrl}/v3/order/place`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`upstox_place_order_failed_${res.status}:${text}`);
    }

    return res.json();
  }

  async getOrderStatus(orderId: string) {
    const res = await fetch(`${this.config.baseUrl}/v2/order/details?order_id=${orderId}`, {
      headers: this.headers(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`upstox_get_order_status_failed_${res.status}`);
    }

    return res.json();
  }

  async getFundsAndMargin() {
    const res = await fetch(`${this.config.baseUrl}/v2/user/get-funds-and-margin`, {
      headers: this.headers(),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`upstox_funds_margin_failed_${res.status}`);
    }

    return res.json();
  }
}
