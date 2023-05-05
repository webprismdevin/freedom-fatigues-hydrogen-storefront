import {Disclosure} from '@headlessui/react';
import {PortableText} from '@portabletext/react';
import {Fragment} from 'react';
import {ProductDetail} from '~/routes/($lang)/products/$productHandle';
import {RichContent} from './RichContent';
import clsx from 'clsx';
import {IconClose} from './Icon';
import {Text} from './Text';

export default function FAQ({data}: {data: any}) {
  return (
    <div className="p-6 md:p-8 lg:p-12">
      <div className="mx-auto grid max-w-prose gap-4">
        {data.title && <h1 className="text-3xl">{data.title}</h1>}
        {data.content && (
          <div dangerouslySetInnerHTML={{__html: data.content}}></div>
        )}
        <div className="mx-auto grid gap-4">
          <hr />
          {data.faqs &&
            data.faqs.map((qa: any) => (
              <Fragment key={qa._id}>
                <Disclosure
                  key={qa.question}
                  as="div"
                  className="grid w-full gap-2"
                >
                  {({open}) => (
                    <>
                      <Disclosure.Button className="text-left">
                        <div className="flex justify-between">
                          <Text size="lead" as="h4">
                            {qa.question}
                          </Text>
                          <IconClose
                            className={clsx(
                              'ml-4 flex-shrink-0 transform-gpu transition-transform duration-200',
                              !open && 'rotate-[45deg]',
                            )}
                          />
                        </div>
                      </Disclosure.Button>

                      <Disclosure.Panel className={'grid gap-2 pb-4 pt-2'}>
                        <RichContent content={qa.answer} />
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
                <hr />
              </Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}

