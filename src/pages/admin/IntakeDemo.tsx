import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IntakeDemo() {
  const navigate = useNavigate();
  const [values1, setValues1] = useState({ gender: "", status: "", children: "" });
  const [values2, setValues2] = useState({ gender: "", status: "", children: "" });
  const [values3, setValues3] = useState({ gender: "", status: "", children: "" });
  const [values4, setValues4] = useState({ gender: "", status: "", children: "" });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/intake')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Intake Form
        </Button>

        <h1 className="text-3xl font-bold">Label Typography Comparison</h1>
        <p className="text-muted-foreground">Choose your preferred font style for form labels</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* OPTION 1: Classic Serif */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 1: Classic Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Elegant & traditional - Georgia/serif font family</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Gender
                </Label>
                <Select value={values1.gender} onValueChange={(v) => setValues1({...values1, gender: v})}>
                  <SelectTrigger id="gender-1" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values1.status} onValueChange={(v) => setValues1({...values1, status: v})}>
                  <SelectTrigger id="status-1" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-1"
                  className="text-lg font-serif font-normal tracking-wide"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values1.children} onValueChange={(v) => setValues1({...values1, children: v})}>
                  <SelectTrigger id="children-1" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 2: Modern Sans-Serif */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Option 2: Modern Sans-Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Clean & contemporary - System UI font stack</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Gender
                </Label>
                <Select value={values2.gender} onValueChange={(v) => setValues2({...values2, gender: v})}>
                  <SelectTrigger id="gender-2" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values2.status} onValueChange={(v) => setValues2({...values2, status: v})}>
                  <SelectTrigger id="status-2" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-2"
                  className="text-base font-medium tracking-tight"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values2.children} onValueChange={(v) => setValues2({...values2, children: v})}>
                  <SelectTrigger id="children-2" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 3: Relaxed Rounded */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 3: Relaxed Rounded</CardTitle>
              <p className="text-sm text-muted-foreground">Friendly & approachable - Rounded sans-serif</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Gender
                </Label>
                <Select value={values3.gender} onValueChange={(v) => setValues3({...values3, gender: v})}>
                  <SelectTrigger id="gender-3" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values3.status} onValueChange={(v) => setValues3({...values3, status: v})}>
                  <SelectTrigger id="status-3" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-3"
                  className="text-lg font-normal tracking-wider"
                  style={{ fontFamily: 'Verdana, Geneva, sans-serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values3.children} onValueChange={(v) => setValues3({...values3, children: v})}>
                  <SelectTrigger id="children-3" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* OPTION 4: Professional Serif (from website) */}
          <Card className="border-2 border-primary/30 bg-primary/10">
            <CardHeader>
              <CardTitle>Option 4: Professional Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Website style - Professional & trustworthy</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Gender
                </Label>
                <Select value={values4.gender} onValueChange={(v) => setValues4({...values4, gender: v})}>
                  <SelectTrigger id="gender-4" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-2">
                <Label 
                  htmlFor="status-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Civil Status
                </Label>
                <Select value={values4.status} onValueChange={(v) => setValues4({...values4, status: v})}>
                  <SelectTrigger id="status-4" className="h-12">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Number of Children */}
              <div className="space-y-2">
                <Label 
                  htmlFor="children-4"
                  className="text-base font-normal tracking-normal"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Number of Children
                </Label>
                <Select value={values4.children} onValueChange={(v) => setValues4({...values4, children: v})}>
                  <SelectTrigger id="children-4" className="h-12">
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4+">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
