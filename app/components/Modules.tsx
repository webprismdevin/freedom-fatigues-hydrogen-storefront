import {Await} from '@remix-run/react';
import {Fragment, Suspense} from 'react';
import {TextWithImage} from './TextWithImage';
import {Hero} from './Hero';
import {CollectionGrid} from './CollectionGrid';
import ShippingAndReturns from './ShippingAndReturns';
import Marquee from './Marquee';
import ReviewCarousel from './ReviewCarousel';
import SlideShow from './Slideshow';

export type PageModule = any;

const moduleSwitch = (module: PageModule) => {
  switch (module._type) {
    case 'component.textWithImage':
      return <TextWithImage data={module} key={module._key} />;
    case 'component.hero':
      return <Hero data={module} key={module._key} />;
    case 'component.collectionGrid':
      return <CollectionGrid data={module} key={module._key} />;
    case 'component.shippingAndReturns':
      return <ShippingAndReturns data={module} key={module._key} />;
    case 'component.marquee':
      return <Marquee data={module} key={module._key} />;
    case 'component.reviewCarousel':
      return <ReviewCarousel data={module} key={module._key} />;
    case 'component.slides':
      return <SlideShow data={module} key={module._key} />;
    // case 'component.swimlane':
    //   return <div>Swimlane</div>;
    default:
      return null;
  }
};

export default function Modules({modules}: {modules: PageModule[]}) {
  return (
    <Fragment>
      {modules && (
        <Suspense>
          <Await resolve={modules}>
            {modules.map((module: PageModule) => moduleSwitch(module))}
          </Await>
        </Suspense>
      )}
    </Fragment>
  );
}