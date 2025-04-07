
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Activity } from "lucide-react";

interface AIVerificationProps {
  state: "verifying" | "success" | "failed";
  progress: number;
  score: number;
}

const AIVerification: React.FC<AIVerificationProps> = ({ state, progress, score }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {state === "verifying" ? (
            <Activity className="h-5 w-5 mr-2 text-blue-500 animate-pulse" />
          ) : state === "success" ? (
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          )}
          AI Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state === "verifying" ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Our AI system is analyzing your submission for quality and accuracy...
              </p>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Analyzing submission</span>
                <span>{progress}%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: state === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                    color: state === "success" ? "rgb(34, 197, 94)" : "rgb(245, 158, 11)"
                  }}
                >
                  {score}%
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    {state === "success" ? "Verification Passed" : "Needs Improvement"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {state === "success" 
                      ? "Your submission meets our quality standards" 
                      : "Your submission needs some improvements"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">AI Feedback:</h3>
                <div className="text-sm text-muted-foreground space-y-2 border-l-2 pl-4" style={{
                  borderColor: state === "success" ? "rgb(34, 197, 94)" : "rgb(245, 158, 11)"
                }}>
                  {state === "success" ? (
                    <>
                      <p>✓ Excellent attention to detail</p>
                      <p>✓ All requirements addressed completely</p>
                      <p>✓ High quality work that exceeds expectations</p>
                    </>
                  ) : (
                    <>
                      <p>✓ Good effort on the main requirements</p>
                      <p>⚠ Some details were missed or incomplete</p>
                      <p>⚠ Quality could be improved in sections 2 and 3</p>
                    </>
                  )}
                </div>
              </div>

              {state === "success" && (
                <div className="rounded-md bg-green-50 p-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Payment processing</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Your payment of USDC is being processed to your connected wallet.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Badge variant={state === "verifying" ? "outline" : state === "success" ? "default" : "secondary"}>
          {state === "verifying" ? "Verification in progress" : state === "success" ? "Verified" : "Revision needed"}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Verification ID: VER-{Math.random().toString(36).substring(2, 10).toUpperCase()}
        </span>
      </CardFooter>
    </Card>
  );
};

export default AIVerification;
