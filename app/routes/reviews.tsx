import {useLoadScript} from '@shopify/hydrogen';

export const loader = async () => {
  return {};
};

export default function ReviewsPage() {
  const scriptStatus = useLoadScript(
    'https://loox.io/widget/loox.js?shop=freedom-fatigues.myshopify.com',
  );

  return (
    <div className="max-w-screen-lg mx-auto py-16">
      <h1 className="text-2xl md:text-4xl text-center font-heading uppercase mb-8">See why 2,000+ people love Freedom Fatigues!</h1>
      {scriptStatus == 'done' && (
        <div id="looxReviews" data-loox-aggregate></div>
      )}
    </div>
  );
}
