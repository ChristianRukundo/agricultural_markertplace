import { FadeIn } from "@/components/animations/FadeIn";
import { SlideInOnScroll } from "@/components/animations/SlideInOnScroll";
import { Card } from "@/components/ui/Card";
import { ABOUT_INFO } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-6">
              About AgriConnect Rwanda
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Connecting farmers and buyers across Rwanda through innovative
              technology
            </p>
          </div>
        </FadeIn>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <SlideInOnScroll direction="left">
            <Card className="p-8 h-full">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {ABOUT_INFO.mission}
              </p>
            </Card>
          </SlideInOnScroll>

          <SlideInOnScroll direction="right">
            <Card className="p-8 h-full">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Our Vision
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {ABOUT_INFO.vision}
              </p>
            </Card>
          </SlideInOnScroll>
        </div>

        <SlideInOnScroll>
          <Card className="p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Our Story
            </h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {ABOUT_INFO.story}
              </p>
            </div>
          </Card>
        </SlideInOnScroll>

        <SlideInOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Our Values
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ABOUT_INFO.values.map((value, index) => (
              <SlideInOnScroll key={index} delay={index * 0.1}>
                <Card className="p-6 text-center h-full">
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </Card>
              </SlideInOnScroll>
            ))}
          </div>
        </SlideInOnScroll>

        <SlideInOnScroll>
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Our Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ABOUT_INFO.team.map((member, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {member.bio}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </SlideInOnScroll>
      </div>
    </div>
  );
}
