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
  const [values5, setValues5] = useState({ gender: "", status: "", children: "" });
  const [values6, setValues6] = useState({ gender: "", status: "", children: "" });
  const [values7, setValues7] = useState({ gender: "", status: "", children: "" });
  const [values8, setValues8] = useState({ gender: "", status: "", children: "" });
  const [values9, setValues9] = useState({ gender: "", status: "", children: "" });
  const [values10, setValues10] = useState({ gender: "", status: "", children: "" });
  const [values11, setValues11] = useState({ gender: "", status: "", children: "" });
  const [values12, setValues12] = useState({ gender: "", status: "", children: "" });
  const [values13, setValues13] = useState({ gender: "", status: "", children: "" });
  const [values14, setValues14] = useState({ gender: "", status: "", children: "" });
  const [values15, setValues15] = useState({ gender: "", status: "", children: "" });

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/intake')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Intake Form
        </Button>

        <h1 className="text-3xl font-bold">Label Typography Comparison</h1>
        <p className="text-muted-foreground">Choose your preferred font style for form labels</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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

          {/* OPTION 5: Clean Muted Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 5: Clean Muted Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Subtle & readable - Light sans-serif</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Gender
                </Label>
                <Select value={values5.gender} onValueChange={(v) => setValues5({...values5, gender: v})}>
                  <SelectTrigger id="gender-5" className="h-12">
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
                  htmlFor="status-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Civil Status
                </Label>
                <Select value={values5.status} onValueChange={(v) => setValues5({...values5, status: v})}>
                  <SelectTrigger id="status-5" className="h-12">
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
                  htmlFor="children-5"
                  className="text-base font-normal tracking-normal text-muted-foreground"
                >
                  Number of Children
                </Label>
                <Select value={values5.children} onValueChange={(v) => setValues5({...values5, children: v})}>
                  <SelectTrigger id="children-5" className="h-12">
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

          {/* OPTION 6: Bold Sans Uppercase */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 6: Bold Sans Uppercase</CardTitle>
              <p className="text-sm text-muted-foreground">Strong & commanding</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-6" className="text-sm font-bold uppercase tracking-widest">
                  Gender
                </Label>
                <Select value={values6.gender} onValueChange={(v) => setValues6({...values6, gender: v})}>
                  <SelectTrigger id="gender-6" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-6" className="text-sm font-bold uppercase tracking-widest">
                  Civil Status
                </Label>
                <Select value={values6.status} onValueChange={(v) => setValues6({...values6, status: v})}>
                  <SelectTrigger id="status-6" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-6" className="text-sm font-bold uppercase tracking-widest">
                  Number of Children
                </Label>
                <Select value={values6.children} onValueChange={(v) => setValues6({...values6, children: v})}>
                  <SelectTrigger id="children-6" className="h-12">
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

          {/* OPTION 7: Light Airy Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 7: Light Airy Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Minimal & spacious</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Gender
                </Label>
                <Select value={values7.gender} onValueChange={(v) => setValues7({...values7, gender: v})}>
                  <SelectTrigger id="gender-7" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Civil Status
                </Label>
                <Select value={values7.status} onValueChange={(v) => setValues7({...values7, status: v})}>
                  <SelectTrigger id="status-7" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-7" className="text-lg font-light tracking-wide text-foreground/70">
                  Number of Children
                </Label>
                <Select value={values7.children} onValueChange={(v) => setValues7({...values7, children: v})}>
                  <SelectTrigger id="children-7" className="h-12">
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

          {/* OPTION 8: Monospace Technical */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 8: Monospace Technical</CardTitle>
              <p className="text-sm text-muted-foreground">Precise & structured</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-8" className="text-sm font-mono font-medium tracking-tight">
                  Gender
                </Label>
                <Select value={values8.gender} onValueChange={(v) => setValues8({...values8, gender: v})}>
                  <SelectTrigger id="gender-8" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-8" className="text-sm font-mono font-medium tracking-tight">
                  Civil Status
                </Label>
                <Select value={values8.status} onValueChange={(v) => setValues8({...values8, status: v})}>
                  <SelectTrigger id="status-8" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-8" className="text-sm font-mono font-medium tracking-tight">
                  Number of Children
                </Label>
                <Select value={values8.children} onValueChange={(v) => setValues8({...values8, children: v})}>
                  <SelectTrigger id="children-8" className="h-12">
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

          {/* OPTION 9: Semibold Tight */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 9: Semibold Tight</CardTitle>
              <p className="text-sm text-muted-foreground">Compact & confident</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-9" className="text-base font-semibold tracking-tight">
                  Gender
                </Label>
                <Select value={values9.gender} onValueChange={(v) => setValues9({...values9, gender: v})}>
                  <SelectTrigger id="gender-9" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-9" className="text-base font-semibold tracking-tight">
                  Civil Status
                </Label>
                <Select value={values9.status} onValueChange={(v) => setValues9({...values9, status: v})}>
                  <SelectTrigger id="status-9" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-9" className="text-base font-semibold tracking-tight">
                  Number of Children
                </Label>
                <Select value={values9.children} onValueChange={(v) => setValues9({...values9, children: v})}>
                  <SelectTrigger id="children-9" className="h-12">
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

          {/* OPTION 10: Elegant Serif Italic */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 10: Elegant Serif Italic</CardTitle>
              <p className="text-sm text-muted-foreground">Sophisticated & distinctive</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Gender
                </Label>
                <Select value={values10.gender} onValueChange={(v) => setValues10({...values10, gender: v})}>
                  <SelectTrigger id="gender-10" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Civil Status
                </Label>
                <Select value={values10.status} onValueChange={(v) => setValues10({...values10, status: v})}>
                  <SelectTrigger id="status-10" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-10" className="text-lg font-serif italic font-normal tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
                  Number of Children
                </Label>
                <Select value={values10.children} onValueChange={(v) => setValues10({...values10, children: v})}>
                  <SelectTrigger id="children-10" className="h-12">
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

          {/* OPTION 11: Small Caps Formal */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 11: Small Caps Formal</CardTitle>
              <p className="text-sm text-muted-foreground">Classic & refined</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Gender
                </Label>
                <Select value={values11.gender} onValueChange={(v) => setValues11({...values11, gender: v})}>
                  <SelectTrigger id="gender-11" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Civil Status
                </Label>
                <Select value={values11.status} onValueChange={(v) => setValues11({...values11, status: v})}>
                  <SelectTrigger id="status-11" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-11" className="text-sm font-medium tracking-wider" style={{ fontVariant: 'small-caps' }}>
                  Number of Children
                </Label>
                <Select value={values11.children} onValueChange={(v) => setValues11({...values11, children: v})}>
                  <SelectTrigger id="children-11" className="h-12">
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

          {/* OPTION 12: Extra Large Bold */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 12: Extra Large Bold</CardTitle>
              <p className="text-sm text-muted-foreground">Maximum visibility</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-12" className="text-xl font-bold tracking-normal">
                  Gender
                </Label>
                <Select value={values12.gender} onValueChange={(v) => setValues12({...values12, gender: v})}>
                  <SelectTrigger id="gender-12" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-12" className="text-xl font-bold tracking-normal">
                  Civil Status
                </Label>
                <Select value={values12.status} onValueChange={(v) => setValues12({...values12, status: v})}>
                  <SelectTrigger id="status-12" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-12" className="text-xl font-bold tracking-normal">
                  Number of Children
                </Label>
                <Select value={values12.children} onValueChange={(v) => setValues12({...values12, children: v})}>
                  <SelectTrigger id="children-12" className="h-12">
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

          {/* OPTION 13: Condensed Sans */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 13: Condensed Sans</CardTitle>
              <p className="text-sm text-muted-foreground">Efficient & modern</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Gender
                </Label>
                <Select value={values13.gender} onValueChange={(v) => setValues13({...values13, gender: v})}>
                  <SelectTrigger id="gender-13" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Civil Status
                </Label>
                <Select value={values13.status} onValueChange={(v) => setValues13({...values13, status: v})}>
                  <SelectTrigger id="status-13" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-13" className="text-base font-medium tracking-tighter" style={{ fontStretch: 'condensed' }}>
                  Number of Children
                </Label>
                <Select value={values13.children} onValueChange={(v) => setValues13({...values13, children: v})}>
                  <SelectTrigger id="children-13" className="h-12">
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

          {/* OPTION 14: Muted Medium Serif */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 14: Muted Medium Serif</CardTitle>
              <p className="text-sm text-muted-foreground">Understated & professional</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Gender
                </Label>
                <Select value={values14.gender} onValueChange={(v) => setValues14({...values14, gender: v})}>
                  <SelectTrigger id="gender-14" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Civil Status
                </Label>
                <Select value={values14.status} onValueChange={(v) => setValues14({...values14, status: v})}>
                  <SelectTrigger id="status-14" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-14" className="text-base font-medium tracking-normal text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                  Number of Children
                </Label>
                <Select value={values14.children} onValueChange={(v) => setValues14({...values14, children: v})}>
                  <SelectTrigger id="children-14" className="h-12">
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

          {/* OPTION 15: Soft Wide Spacing */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 15: Soft Wide Spacing</CardTitle>
              <p className="text-sm text-muted-foreground">Gentle & breathing room</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gender-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Gender
                </Label>
                <Select value={values15.gender} onValueChange={(v) => setValues15({...values15, gender: v})}>
                  <SelectTrigger id="gender-15" className="h-12">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Civil Status
                </Label>
                <Select value={values15.status} onValueChange={(v) => setValues15({...values15, status: v})}>
                  <SelectTrigger id="status-15" className="h-12">
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
              <div className="space-y-2">
                <Label htmlFor="children-15" className="text-base font-normal tracking-widest text-foreground/75">
                  Number of Children
                </Label>
                <Select value={values15.children} onValueChange={(v) => setValues15({...values15, children: v})}>
                  <SelectTrigger id="children-15" className="h-12">
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
