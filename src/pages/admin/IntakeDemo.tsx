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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate('/admin/intake')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Intake Form
        </Button>

        <h1 className="text-3xl font-bold">Select Field Design Comparison</h1>
        <p className="text-muted-foreground">Choose your preferred design style for form labels and inputs</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* OPTION 1: Minimalist Clean */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 1: Minimalist Clean</CardTitle>
              <p className="text-sm text-muted-foreground">Material Design inspired - Professional & clean</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-1"
                  className="text-xs uppercase tracking-wider text-muted-foreground font-medium"
                >
                  Gender
                </Label>
                <Select value={values1.gender} onValueChange={(v) => setValues1({...values1, gender: v})}>
                  <SelectTrigger 
                    id="gender-1"
                    className="h-12 border border-border hover:border-primary/50 transition-colors"
                  >
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
                  className="text-xs uppercase tracking-wider text-muted-foreground font-medium"
                >
                  Civil Status
                </Label>
                <Select value={values1.status} onValueChange={(v) => setValues1({...values1, status: v})}>
                  <SelectTrigger 
                    id="status-1"
                    className="h-12 border border-border hover:border-primary/50 transition-colors"
                  >
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
                  className="text-xs uppercase tracking-wider text-muted-foreground font-medium"
                >
                  Number of Children
                </Label>
                <Select value={values1.children} onValueChange={(v) => setValues1({...values1, children: v})}>
                  <SelectTrigger 
                    id="children-1"
                    className="h-12 border border-border hover:border-primary/50 transition-colors"
                  >
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

          {/* OPTION 2: Modern Bold */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Option 2: Modern Bold</CardTitle>
              <p className="text-sm text-muted-foreground">Current style refined - Confident & modern</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-3">
                <Label 
                  htmlFor="gender-2"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  Gender
                </Label>
                <Select value={values2.gender} onValueChange={(v) => setValues2({...values2, gender: v})}>
                  <SelectTrigger 
                    id="gender-2"
                    className="h-14 border-2 border-border hover:border-primary hover:shadow-md transition-all rounded-lg"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Civil Status */}
              <div className="space-y-3">
                <Label 
                  htmlFor="status-2"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  Civil Status
                </Label>
                <Select value={values2.status} onValueChange={(v) => setValues2({...values2, status: v})}>
                  <SelectTrigger 
                    id="status-2"
                    className="h-14 border-2 border-border hover:border-primary hover:shadow-md transition-all rounded-lg"
                  >
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
              <div className="space-y-3">
                <Label 
                  htmlFor="children-2"
                  className="text-sm font-semibold flex items-center gap-2"
                >
                  <span className="w-1 h-4 bg-primary rounded-full"></span>
                  Number of Children
                </Label>
                <Select value={values2.children} onValueChange={(v) => setValues2({...values2, children: v})}>
                  <SelectTrigger 
                    id="children-2"
                    className="h-14 border-2 border-border hover:border-primary hover:shadow-md transition-all rounded-lg"
                  >
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

          {/* OPTION 3: Soft & Friendly */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Option 3: Soft & Friendly</CardTitle>
              <p className="text-sm text-muted-foreground">Approachable design - Warm & welcoming</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Gender */}
              <div className="space-y-2">
                <Label 
                  htmlFor="gender-3"
                  className="text-xs font-normal text-muted-foreground/80 px-1"
                >
                  Gender
                </Label>
                <Select value={values3.gender} onValueChange={(v) => setValues3({...values3, gender: v})}>
                  <SelectTrigger 
                    id="gender-3"
                    className="h-12 rounded-full border-0 bg-muted/50 hover:bg-muted transition-colors"
                  >
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
                  className="text-xs font-normal text-muted-foreground/80 px-1"
                >
                  Civil Status
                </Label>
                <Select value={values3.status} onValueChange={(v) => setValues3({...values3, status: v})}>
                  <SelectTrigger 
                    id="status-3"
                    className="h-12 rounded-full border-0 bg-muted/50 hover:bg-muted transition-colors"
                  >
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
                  className="text-xs font-normal text-muted-foreground/80 px-1"
                >
                  Number of Children
                </Label>
                <Select value={values3.children} onValueChange={(v) => setValues3({...values3, children: v})}>
                  <SelectTrigger 
                    id="children-3"
                    className="h-12 rounded-full border-0 bg-muted/50 hover:bg-muted transition-colors"
                  >
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
