import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <main className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      
      <div className="mb-12">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-lg font-medium">
              What is AnimeVerse?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              AnimeVerse is a premier anime streaming platform offering a vast collection of anime series and movies.
              We provide high-quality video streaming, user profiles, favorites lists, and personalized recommendations.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-lg font-medium">
              Is AnimeVerse free to use?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Yes, AnimeVerse offers free access to our basic content library. We also offer premium subscriptions
              with additional benefits such as ad-free viewing, early access to new releases, and exclusive content.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-lg font-medium">
              How do I create an account?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              To create an account, click on the "Sign Up" button in the top-right corner of the site. Fill in your
              username, email address, and create a password. Follow the verification steps sent to your email to
              complete your registration.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-lg font-medium">
              Can I download anime episodes for offline viewing?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              Premium subscribers have access to our download feature, which allows you to save episodes for offline
              viewing. This feature is available on our mobile apps for iOS and Android.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-lg font-medium">
              How often is new content added?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              We update our library regularly with new episodes and series. Simulcast anime episodes are typically
              available within 24 hours of their original broadcast in Japan.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-lg font-medium">
              How do I report technical issues?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              If you encounter any technical issues while using AnimeVerse, please visit our Contact page and
              submit a support ticket. Our technical team will respond as soon as possible to help resolve your issue.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7">
            <AccordionTrigger className="text-lg font-medium">
              What devices can I use to watch AnimeVerse?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              AnimeVerse is available on web browsers, iOS and Android mobile devices, smart TVs, gaming consoles,
              and streaming devices like Roku, Apple TV, and Amazon Fire TV.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8">
            <AccordionTrigger className="text-lg font-medium">
              How do I cancel my subscription?
            </AccordionTrigger>
            <AccordionContent className="text-gray-600 dark:text-gray-400">
              You can cancel your subscription at any time by going to your Account Settings and selecting
              "Subscription Management." Follow the cancellation steps to complete the process.
              You'll continue to have access to premium features until the end of your billing cycle.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="bg-secondary/20 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Still Have Questions?</h2>
        <p className="mb-4">
          If you couldn't find the answer to your question, please contact our support team.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Contact Support
        </a>
      </div>
    </main>
  );
}