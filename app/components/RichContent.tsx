import {PortableText} from '@portabletext/react';

const components = {
  types: {
    HTML: ({value}) => (
      <div
        dangerouslySetInnerHTML={{
          __html: value.code,
        }}
      />
    ),
  },
  block: {
    // Ex. 1: customizing common block types
    h1: ({children}) => <h1 className="py-4 text-3xl font-bold">{children}</h1>,
    h2: ({children}) => <h2 className="py-3 text-2xl font-bold">{children}</h2>,
    h3: ({children}) => <h3 className="py-2 text-xl font-bold">{children}</h3>,
    h4: ({children}) => <h4 className="py-1 text-lg font-bold">{children}</h4>,
    h5: ({children}) => (
      <h5 className="py-1 text-base font-bold">{children}</h5>
    ),
    h6: ({children}) => <h6 className="py-1 text-sm font-bold">{children}</h6>,
    // blockquote: ({children}) => (
    //   <blockquote className="border-l-purple-500">{children}</blockquote>
    // ),
  },
  list: {
    // Ex. 1: customizing common list types
    bullet: ({children}) => (
      <ul className="mt-lg ml-5 list-disc">{children}</ul>
    ),
    number: ({children}) => (
      <ol className="mt-lg ml-5 list-decimal">{children}</ol>
    ),

    // Ex. 2: rendering custom lists
    checkmarks: ({children}) => <ol className="m-auto text-lg">{children}</ol>,
  },
  marks: {
    em: ({children}) => (
      <em className="font-semibold text-gray-600">{children}</em>
    ),

    // Ex. 2: rendering a custom `link` annotation
    link: ({value, children}) => {
      const target = (value?.href || '').startsWith('http')
        ? '_blank'
        : undefined;
      return (
        <a
          href={value?.href}
          className="text-red-500"
          target={target}
          rel={target === '_blank' && 'noindex nofollow'}
        >
          {children}
        </a>
      );
    },
  },
};

export function RichContent({content}: {content: any}) {
  return <PortableText value={content} components={components} />;
}
