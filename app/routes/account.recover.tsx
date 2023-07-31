import {
  json,
  redirect,
  type ActionFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from '@shopify/remix-oxygen';
import {Form, useActionData} from '@remix-run/react';
import {useState} from 'react';
import {Link} from '~/components';
import {getInputStyleClasses} from '~/utils';
import type {CustomerRecoverPayload} from '@shopify/hydrogen/storefront-api-types';

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  return new Response(null);
}

type ActionData = {
  formError?: string;
  resetRequested?: boolean;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return badRequest({
      formError: 'Please provide an email.',
    });
  }

  try {
    await context.storefront.mutate<{
      customerRecover: CustomerRecoverPayload;
    }>(CUSTOMER_RECOVER_MUTATION, {
      variables: {email},
    });

    return json({resetRequested: true});
  } catch (error: any) {
    return badRequest({
      formError: 'Something went wrong. Please try again later.',
    });
  }
};

export const meta: V2_MetaFunction = () => {
  return [{title: 'Recover Password'}];
};

export default function Recover() {
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const isSubmitted = actionData?.resetRequested;

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        {isSubmitted ? (
          <>
            <h1 className="text-4xl">Request Sent.</h1>
            <p className="mt-4">
              If that email address is in our system, you will receive an email
              with instructions about how to reset your password in a few
              minutes.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl">Forgot Password.</h1>
            <p className="mt-4">
              Enter the email address associated with your account to receive a
              link to reset your password.
            </p>
            {/* TODO: Add onSubmit to validate _before_ submission with native? */}
            <Form
              method="post"
              noValidate
              className="mb-4 mt-4 space-y-3 pb-8 pt-6"
            >
              {actionData?.formError && (
                <div className="mb-6 flex items-center justify-center bg-zinc-500">
                  <p className="text-s m-4 text-contrast">
                    {actionData.formError}
                  </p>
                </div>
              )}
              <div>
                <input
                  className={`mb-1 ${getInputStyleClasses(nativeEmailError)}`}
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  onBlur={(event) => {
                    setNativeEmailError(
                      event.currentTarget.value.length &&
                        !event.currentTarget.validity.valid
                        ? 'Invalid email address'
                        : null,
                    );
                  }}
                />
                {nativeEmailError && (
                  <p className="text-xs text-red-500">
                    {nativeEmailError} &nbsp;
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <button
                  className="focus:shadow-outline block w-full rounded bg-primary px-4 py-2 text-contrast"
                  type="submit"
                >
                  Request Reset Link
                </button>
              </div>
              <div className="mt-8 flex items-center border-t border-gray-300">
                <p className="mt-6 align-baseline text-sm">
                  Return to &nbsp;
                  <Link className="inline underline" to="/account/login">
                    Login
                  </Link>
                </p>
              </div>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}

const CUSTOMER_RECOVER_MUTATION = `#graphql
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;
