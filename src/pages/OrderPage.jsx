import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useStore } from '../store.jsx';
import { Button, EmptyState } from '../ui.jsx';
import OrderSummary from '../components/OrderSummary.jsx';

/* /order/ZMV-123456: the summary of an order from "My orders" (orders live in this browser, see store.jsx) */
export default function OrderPage() {
  const { id } = useParams(), { orders } = useStore(), order = orders.find(o => o.id === id);
  if (!order) return <main className="section-wrap min-h-[55vh] pt-12"><EmptyState title="We can’t find that order" body="It may have been placed on another device or browser. Your orders on this device are in your profile." action={<Button to="/profile?tab=orders">My orders <ArrowRight size={16} /></Button>} /></main>;
  return <main className="section-wrap min-h-[60vh] pb-16 pt-8"><OrderSummary order={order} /></main>;
}
