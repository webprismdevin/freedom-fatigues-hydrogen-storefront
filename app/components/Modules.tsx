import {Await} from '@remix-run/react';
import {Fragment, Suspense} from 'react';
import {TextWithImage} from './TextWithImage';
import {Hero} from './Hero';
import {CollectionGrid} from './CollectionGrid';
import ShippingAndReturns from './ShippingAndReturns';
import Marquee from './Marquee';
import ReviewCarousel from './ReviewCarousel';
import SlideShow from './Slideshow';
import {Columns} from './Columns';
import FAQ from './FAQ';
import {RichContent} from './RichContent';

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
    case 'component.columns':
      return <Columns data={module} key={module._key} />;
    case 'component.faqSection':
      return <FAQ data={module} key={module._key} />;
    case 'component.richContent':
      return (
        <div className="mx-auto max-w-screen-lg p-8 md:p-12 lg:p-24">
          <RichContent content={module.content} key={module._key} />
        </div>
      );
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
