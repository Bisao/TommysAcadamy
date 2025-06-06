
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SVOItem {
  number: string;
  subject: string;
  verb: string;
  object: string;
  translation: string;
}

const svoData: SVOItem[] = [
  { number: "01", subject: "I", verb: "ALWAYS", object: "YOU", translation: "EU SEMPRE VOCÊ" },
  { number: "02", subject: "YOU", verb: "SHOULD", object: "ME", translation: "VOCÊ DEVERIA EU" },
  { number: "03", subject: "WE", verb: "USUALLY", object: "HER", translation: "NÓS GERALMENTE ELA" },
  { number: "04", subject: "THEY", verb: "WOULD", object: "HIM", translation: "ELES/ELAS GOSTARIAM ELE" },
  { number: "05", subject: "HE", verb: "OFTEN", object: "US", translation: "ELE FREQUENTEMENTE NÓS" },
  { number: "06", subject: "SHE", verb: "COULD", object: "SOMETIMES", translation: "ELA PODERIA ÀS VEZES" },
  { number: "07", subject: "IT", verb: "MIGHT", object: "THEM", translation: "ISSO TALVEZ ELES/ELAS" },
  { number: "08", subject: "WE", verb: "CAN", object: "NEVER", translation: "NÓS PODEMOS NUNCA" },
  { number: "09", subject: "THEY", verb: "SELDOM", object: "MUST", translation: "ELES/ELAS RARAMENTE DEVE" },
  { number: "10", subject: "HE", verb: "MAY", object: "THEY", translation: "ELE PODE ELES/ELAS" },
  { number: "11", subject: "SHE", verb: "NEVER", object: "WE", translation: "ELA NUNCA NÓS" },
  { number: "12", subject: "I", verb: "MAY", object: "US", translation: "EU POSSO NÓS" }
];

export default function SVOTable() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-red-500 text-white">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <span className="bg-white text-red-500 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">6</span>
          S.V.O.
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-4 gap-1 bg-gray-100">
          {svoData.map((item, index) => (
            <div key={item.number} className="bg-white border border-gray-300 p-3 text-center">
              <div className="font-bold text-red-500 mb-2">
                <span className="bg-red-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-sm">
                  +
                </span>
                {item.number}
              </div>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{item.subject}</div>
                <div className="font-semibold">{item.verb}</div>
                <div className="font-semibold">{item.object}</div>
                <div className="text-gray-600 text-xs">{item.translation}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
