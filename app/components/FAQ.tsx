import {Fragment} from 'react';
import {ProductDetail} from '~/routes/($lang)/products/$productHandle';

export default function FAQ({data}: {data: any}) {
  return (
    <div>
      {data.title && <h1>{data.title}</h1>}
      {data.content && (
        <div dangerouslySetInnerHTML={{__html: data.content}}></div>
      )}
      <div className="mx-auto grid max-w-prose-wide gap-4 p-6 md:p-8 lg:p-12">
        <hr />
        {data.faqs &&
          data.faqs.map((qa: any) => (
            <Fragment key={qa._id}>
              <ProductDetail
                title={qa.question as string}
                content={qa.answer as string}
              />
              <hr />
            </Fragment>
          ))}
      </div>
    </div>
  );
}
