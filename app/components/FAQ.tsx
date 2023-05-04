import {ProductDetail} from '~/routes/($lang)/products/$productHandle';

export default function FAQ({data}: {data: any}) {
  return (
    <div>
      {data.title && <h1>{data.title}</h1>}
      {data.content && (
        <div dangerouslySetInnerHTML={{__html: data.content}}></div>
      )}
      <div className="mx-auto grid max-w-prose-wide gap-4">
        <hr />
        {data.faqs &&
          data.faqs.map((qa: any) => (
            <>
              <ProductDetail
                key={qa._id}
                title={qa.question as string}
                content={qa.answer as string}
              />
              <hr />
            </>
          ))}
      </div>
    </div>
  );
}
