import { useLocale } from "next-intl";
import Image from "next/image";

export function DirectorMessage() {
  const locale = useLocale();

  const isMr = locale === "mr";

  const content = {
    title: isMr ? "संचालकांचा संदेश" : "Director's Message",
    message: isMr
      ? "शासकीय सेवेत यश मिळविणे हे केवळ ध्येय नसून ती एक जबाबदारी आणि समाजसेवेची संधी आहे. या ध्येयापर्यंत पोहोचण्यासाठी कठोर परिश्रम, योग्य मार्गदर्शन आणि दृढ आत्मविश्वास आवश्यक असतो. बळीराजा करिअर अकॅडमीच्या माध्यमातून विद्यार्थ्यांना गुणवत्तापूर्ण प्रशिक्षण, स्पर्धात्मक वातावरण आणि यशाचा योग्य मार्ग मिळावा, यासाठी आम्ही सातत्याने प्रयत्नशील आहोत. प्रत्येक विद्यार्थ्यामध्ये असलेल्या क्षमतेवर आमचा विश्वास आहे आणि त्या क्षमतेला योग्य दिशा देणे हेच आमचे कर्तव्य आहे. आजच्या स्पर्धेच्या युगात केवळ आश्वासने देऊन यश मिळत नाही. म्हणूनच बळीराजा करिअर अकॅडमीमध्ये मी स्वतः विद्यार्थ्यांना मार्गदर्शन करतो, त्यांच्या प्रगतीवर लक्ष ठेवतो आणि प्रत्येक टप्प्यावर त्यांना योग्य दिशा देण्याचा प्रयत्न करतो. विद्यार्थ्यांचे यश हेच आमच्या कार्याचे खरे मोजमाप आहे. आज विविध शासकीय विभागांमध्ये यशस्वीपणे कार्यरत असलेले आमचे विद्यार्थी हीच आमच्या कार्याची खरी ओळख आहे. तुमच्या यशातच आमचे समाधान आणि प्रेरणा दडलेली आहे. आम्ही फक्त आश्वासने देत नाही, तर प्रत्येक विद्यार्थ्याच्या यशाच्या प्रवासात त्याच्यासोबत खंबीरपणे उभे राहतो. मोठी स्वप्ने पाहा, त्यासाठी प्रामाणिकपणे मेहनत घ्या आणि यश तुमचेच असेल."
      : "Securing success in government service is not merely a goal, but a responsibility and an opportunity to serve society. To achieve this goal, hard work, proper guidance, and strong self-confidence are essential. Through Baliraja Career Academy, we are continuously striving to provide students with quality training, a competitive environment, and the right path to success. We believe in the potential within every student, and guiding that potential in the right direction is our duty. In today's competitive era, success cannot be achieved by mere promises alone. Therefore, at Baliraja Career Academy, I personally guide students, monitor their progress, and endeavor to give them the right direction at every stage. The success of our students is the true measure of our work. Our students currently working successfully across various government departments are the real identity of our efforts. Your success holds our satisfaction and inspiration. We do not just give promises; we stand firmly beside every student throughout their journey to success. Dream big, work hard honestly for it, and success will surely be yours.",
    name: isMr ? "अजित जाधव पाटील" : "Ajit Jadhav Patil",
    role: isMr
      ? "संस्थापक, बळीराजा करिअर अकॅडमी, गंगापूर"
      : "Founder, Baliraja Career Academy, Gangapur",
  };

  return (
    <section className="bg-stone py-20 sm:py-28 overflow-hidden">
      <div className="mx-auto max-w-[104rem] px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Image Column */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start relative">
            <div className="relative w-full max-w-[22rem] lg:max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-parchment-deep shadow-xl border border-cream/20">
              <div className="absolute inset-0 bg-oxblood-deep/5 pointer-events-none z-10" />
              <Image
                src="https://pub-11457997cc6b4ce2b7a38cb3684de3f2.r2.dev/__A49I4821Ip.jpg-removebg-preview.png"
                alt={content.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-top"
              />
            </div>
            
            {/* Decorative background shape */}
            <div className="absolute -z-10 -bottom-6 -left-6 h-full w-full max-w-[22rem] lg:max-w-md rounded-2xl bg-oxblood-deep/10" />
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <h2 className={`font-title text-[clamp(2.5rem,5vw,3.5rem)] font-normal text-ink ${isMr ? "leading-[1.15]" : "leading-[0.84]"}`}>
              {content.title}
            </h2>
            
            <div className="mt-8 relative">
              <span className="absolute -top-6 -left-4 text-7xl text-river/20 font-serif leading-none select-none">
                "
              </span>
              <p className="relative z-10 text-[1.15rem] sm:text-[1.35rem] leading-[1.7] text-ink-soft text-pretty">
                {content.message}
              </p>
            </div>
            
            <div className="mt-10 pt-8 border-t border-line">
              <p className="font-display text-2xl font-semibold text-ink">
                {content.name}
              </p>
              <p className="mt-1 text-[0.88rem] uppercase tracking-[0.1em] text-river font-semibold">
                {content.role}
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
