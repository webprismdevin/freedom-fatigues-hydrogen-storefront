import {
  json,
  redirect,
  type ActionFunction,
  type AppLoadContext,
  type LoaderArgs,
  MetaFunction,
} from '@shopify/remix-oxygen';
import {
  Form,
  useActionData,
  useLoaderData,
} from '@remix-run/react';
import {useState} from 'react';
import {getInputStyleClasses} from '~/lib/utils';
import {Link} from '~/components';
import type {CustomerAccessTokenCreatePayload} from '@shopify/hydrogen/storefront-api-types';

export const handle = {
  isPublic: true,
};

export async function loader({context, params}: LoaderArgs) {
  const customerAccessToken = await context.session.get('customerAccessToken');

  if (customerAccessToken) {
    return redirect(params.lang ? `${params.lang}/account` : '/account');
  }

  // TODO: Query for this?
  return json({shopName: 'Freedom Fatigues'});
}

type ActionData = {
  formError?: string;
};

const badRequest = (data: ActionData) => json(data, {status: 400});

export const action: ActionFunction = async ({request, context, params}) => {
  const formData = await request.formData();

  const email = formData.get('email');
  const password = formData.get('password');

  if (
    !email ||
    !password ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      formError: 'Please provide both an email and a password.',
    });
  }

  const {session, storefront} = context;

  try {
    const customerAccessToken = await doLogin(context, {email, password});
    session.set('customerAccessToken', customerAccessToken);

    return redirect(params.lang ? `/${params.lang}/account` : '/account');
  } catch (error: any) {
    // Parse the error message which contains the Shopify error details
    try {
      const errorDetails = JSON.parse(error.message);
      const shopifyError = Array.isArray(errorDetails) ? errorDetails[0] : null;
      
      console.error('Login error details:', JSON.stringify({
        code: shopifyError?.code,
        field: shopifyError?.field,
        message: shopifyError?.message
      }, null, 2));

      // Handle specific error codes
      switch (shopifyError?.code) {
        case 'UNIDENTIFIED_CUSTOMER':
          return badRequest({
            formError: 'Invalid email or password. Please try again or click "Forgot password" below to reset it.',
          });
        default:
          return badRequest({
            formError: 'An error occurred while signing in. Please try again.',
          });
      }
    } catch (parseError) {
      // If we can't parse the error, log it and return a generic message
      console.error('Error parsing login error:', error.message);
      return badRequest({
        formError: 'An unexpected error occurred. Please try again.',
      });
    }
  }
};

export const meta: MetaFunction = () => ({
  title: 'Login',
});

export default function Login() {
  const {shopName} = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [nativeEmailError, setNativeEmailError] = useState<null | string>(null);
  const [nativePasswordError, setNativePasswordError] = useState<null | string>(
    null,
  );

  return (
    <div className="my-24 flex justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl">Sign in.</h1>
        {/* TODO: Add onSubmit to validate _before_ submission with native? */}
        <Form
          method="post"
          noValidate
          className="mb-4 mt-4 space-y-3 pb-8 pt-6"
        >
          {actionData?.formError && (
            <div className="mb-6 flex items-center justify-center bg-zinc-500">
              <p className="text-s m-4 text-contrast">{actionData.formError}</p>
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
              <p className="text-xs text-red-500">{nativeEmailError} &nbsp;</p>
            )}
          </div>

          <div>
            <input
              className={`mb-1 ${getInputStyleClasses(nativePasswordError)}`}
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              aria-label="Password"
              minLength={8}
              required
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              onBlur={(event) => {
                if (
                  event.currentTarget.validity.valid ||
                  !event.currentTarget.value.length
                ) {
                  setNativePasswordError(null);
                } else {
                  setNativePasswordError(
                    event.currentTarget.validity.valueMissing
                      ? 'Please enter a password'
                      : 'Passwords must be at least 8 characters',
                  );
                }
              }}
            />
            {nativePasswordError && (
              <p className="text-xs text-red-500">
                {' '}
                {nativePasswordError} &nbsp;
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="focus:shadow-outline block w-full rounded bg-primary px-4 py-2 text-contrast"
              type="submit"
              disabled={!!(nativePasswordError || nativeEmailError)}
            >
              Sign in
            </button>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-gray-300">
            <p className="mt-6 align-baseline text-sm">
              New to {shopName}? &nbsp;
              <Link className="inline underline" to="/account/register">
                Create an account
              </Link>
            </p>
            <Link
              className="mt-6 inline-block align-baseline text-sm text-primary/50"
              to="/account/recover"
            >
              Forgot password
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

const LOGIN_MUTATION = `#graphql
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        code
        field
        message
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
`;

export async function doLogin(
  {storefront}: AppLoadContext,
  {
    email,
    password,
  }: {
    email: string;
    password: string;
  },
) {
  const data = await storefront.mutate<{
    customerAccessTokenCreate: CustomerAccessTokenCreatePayload;
  }>(LOGIN_MUTATION, {
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
    return data.customerAccessTokenCreate.customerAccessToken.accessToken;
  }

  // Improve error handling by including the actual customer errors
  const errors = data?.customerAccessTokenCreate?.customerUserErrors;
  if (errors?.length) {
    throw new Error(JSON.stringify(errors));
  }

  throw new Error('Login failed: Unknown error occurred');
}
