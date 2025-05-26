import { Button } from "@/components/ui/button";
import Link from "next/link";

const ThankYouCallout = () => {
  return (
    <div className="p-5 bg-gray-100 border border-gray-300 rounded-md text-center my-5">
      <p className="mb-4">
        Vi setter skikkelig pris på at du var med på dette lille eksperimentet.
        Nå er moroa over, og opplastningen stengt, men vi digger at du bidro!
      </p>
      <Button className="mt-4" asChild>
        <Link href="/gallery">Se galleriet her</Link>
      </Button>
    </div>
  );
};

export default ThankYouCallout;
