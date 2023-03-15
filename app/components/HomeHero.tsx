import {urlFor} from '~/lib/sanity';

export default function HomeHero({data}: any) {
  console.log(data);
  const content = data.content[0];
  const image = content.image;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-gray-100"
      style={{marginTop: -96}}
    >
      <img src={urlFor(image.asset).url()} alt="" />
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '100%',
          left: `${content.productHotspots[0].x}%`,
          top: `${content.productHotspots[0].y}%`,
          zIndex: 1,
          padding: 8,
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 24,
            width: 24,
            borderRadius: '100%',
          }}
        >
          <div>+</div>
        </div>
      </div>
    </div>
  );
}
