import { useState } from "react";
import { X, Maximize2, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FamilyTree } from "@/components/FamilyTree";

const dummyClient = {
  firstName: "Jan",
  lastName: "Kowalski",
  dateOfBirth: "15.05.1985",
  placeOfBirth: "Warsaw, Poland",
  isPolish: true,
  sex: "M",
};

const dummyFather = {
  firstName: "Andrzej",
  lastName: "Kowalski",
  dateOfBirth: "10.03.1960",
  placeOfBirth: "Krakow, Poland",
  isPolish: true,
};

const dummyMother = {
  firstName: "Maria",
  lastName: "Kowalska",
  maidenName: "Nowak",
  dateOfBirth: "20.07.1962",
  placeOfBirth: "Gdansk, Poland",
  isPolish: true,
};

const dummyPaternalGF = {
  firstName: "Józef",
  lastName: "Kowalski",
  dateOfBirth: "05.11.1935",
  placeOfBirth: "Poznan, Poland",
  isPolish: true,
};

const dummyPaternalGM = {
  firstName: "Anna",
  lastName: "Kowalska",
  maidenName: "Lewandowska",
  dateOfBirth: "15.01.1938",
  placeOfBirth: "Wroclaw, Poland",
  isPolish: true,
};

const dummyMaternalGF = {
  firstName: "Stefan",
  lastName: "Nowak",
  dateOfBirth: "22.04.1937",
  placeOfBirth: "Lodz, Poland",
  isPolish: true,
};

const dummyMaternalGM = {
  firstName: "Zofia",
  lastName: "Nowak",
  maidenName: "Wiśniewska",
  dateOfBirth: "30.09.1940",
  placeOfBirth: "Lublin, Poland",
  isPolish: true,
};

interface FamilyTreeDemoProps {
  onClose: () => void;
}

export default function FamilyTreeDemo({ onClose }: FamilyTreeDemoProps) {
  const [isLargeFonts, setIsLargeFonts] = useState(false);

  return (
    <div className={`p-6 ${isLargeFonts ? 'text-lg' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
          Family Tree
        </h2>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsLargeFonts(!isLargeFonts)} variant="ghost" size="icon" title="Toggle large fonts">
            <Type className="h-6 w-6" />
          </Button>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <FamilyTree
        clientData={dummyClient}
        father={dummyFather}
        mother={dummyMother}
        paternalGrandfather={dummyPaternalGF}
        paternalGrandmother={dummyPaternalGM}
        maternalGrandfather={dummyMaternalGF}
        maternalGrandmother={dummyMaternalGM}
      />
    </div>
  );
}
