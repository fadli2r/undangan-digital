import Image from 'next/image';

export default function OurStory({ data }) {
  if (!data || !data.title) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent">
          {data.title}
        </h2>
        
        {data.main_photo && (
          <div className="relative w-full aspect-[3/2] mb-12 rounded-xl overflow-hidden shadow">
            <Image
              src={data.main_photo}
              alt="Our Story"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 800px"
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-16">
          {data.stories?.map((story, index) => (
            <div
              key={index}
              className={`flex flex-col md:flex-row items-center gap-8 ${
                index % 2 === 0 ? '' : 'md:flex-row-reverse'
              }`}
            >
              {/* Bisa tambahkan story.image jika ingin */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-3 text-pink-500">{story.heading}</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{story.content}</p>
              </div>
              {/* OPTIONAL: Jika suatu hari ingin tambah gambar per cerita
              {story.image && (
                <div className="w-48 h-48 relative rounded-xl overflow-hidden flex-shrink-0 shadow">
                  <Image
                    src={story.image}
                    alt={story.heading}
                    fill
                    className="object-cover"
                  />
                </div>
              )} */}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
