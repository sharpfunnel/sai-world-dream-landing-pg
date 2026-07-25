import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import MasterPlan from "@/components/MasterPlan";
import Pricing from "@/components/Pricing";
import FloorPlans from "@/components/FloorPlans";
import Amenities from "@/components/Amenities";
import WhyInvest from "@/components/WhyInvest";
import LocationAdvantages from "@/components/LocationAdvantages";
import Specifications from "@/components/Specifications";
import Lifestyle from "@/components/Lifestyle";
import Gallery from "@/components/Gallery";
import ConstructionStatus from "@/components/ConstructionStatus";
import AboutDeveloper from "@/components/AboutDeveloper";
import FAQ from "@/components/FAQ";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <Hero />
        <About />
        <MasterPlan />
        <Pricing />
        <FloorPlans />
        <Amenities />
        <WhyInvest />
        <LocationAdvantages />
        <Specifications />
        <Lifestyle />
        <Gallery />
        <ConstructionStatus />
        <AboutDeveloper />
        <FAQ />
        <ContactSection />
      </main>
      <Footer />
      <FloatingButtons />
    </>
  );
}
