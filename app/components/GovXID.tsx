export default function GovXID({center}: {center?: boolean}) {
  return (
    <div
      style={{
        fontStyle: 'normal',
        clear: 'both',
        display: 'block !important',
        width: '100%',
        // padding: '20px 0 !important',
        letterSpacing: 'initial',
        textTransform: 'none',
      }}
    >
      <span style={{display: 'flex !important', boxSizing: 'border-box'}}>
        <a
          target="popup"
          className={`${center ? 'mx-auto' : ''}`}
          style={{
            display: 'flex',
            width: '100% !important',
            color: '#333 !important',
            backgroundColor: 'white !important',
            flexDirection: 'row',
            padding: '10px',
            justifyContent: 'center',
            textAlign: 'left',
            textDecoration: 'none',
            borderRadius: '5px !important',
          }}
          href="https://auth.govx.com/shopify/verify?shop=freedom-fatigues.myshopify.com&utm_source=shopify&utm_medium=govxid&utm_campaign=custom_link"
        >
          <span
            style={{
              display: 'block',
              flexGrow: '0',
              alignSelf: 'center',
              boxSizing: 'border-box',
              width: '30px',
            }}
          >
            <img
              alt="govx-id-new-logo-shield-black"
              src="https://i1.govx.net/images/cdn/govx-id-new-logo-shield-black.png?t=801"
              loading="lazy"
            />
          </span>
          <span
            style={{
              display: 'block',
              flexGrow: '0',
              flexWrap: 'wrap',
              alignSelf: 'center',
              paddingLeft: '15px',
            }}
          >
            <p
              className="max-w-[175px] md:max-w-[300px]"
              style={{
                color: '#333',
                lineHeight: '16px',
                fontSize: '14px',
                margin: '0px',
                fontFamily: 'sans-serif',
              }}
            >
              Military & First Responder Discount Available.
            </p>
          </span>
        </a>
      </span>
    </div>
  );
}
