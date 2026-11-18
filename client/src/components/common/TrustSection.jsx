
import {
  Truck,
  ShieldCheck,
  RefreshCcw,
  Headset,
} from "lucide-react";

import "./TrustSection.css";

const benefits = [
  {
    id: 1,
    title: "Free Delivery",
    description: "Enjoy convenient delivery on eligible orders.",
    icon: Truck,
  },
  {
    id: 2,
    title: "Secure Payments",
    description: "Shop with confidence using secure payments.",
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: "Easy Returns",
    description: "Simple returns according to our return policy.",
    icon: RefreshCcw,
  },
  {
    id: 4,
    title: "Customer Support",
    description: "We're here to help when you need us.",
    icon: Headset,
  },
];

function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-grid">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <div className="trust-card" key={benefit.id}>
              <Icon size={35} />

              <h3>{benefit.title}</h3>

              <p>{benefit.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustSection;
