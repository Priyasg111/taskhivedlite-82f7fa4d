
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-12">
      {/* Hero section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-brand-teal py-16 px-6 text-white text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRjMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyem0tMjAgMGMwIDEuMS0uOSAyLTIgMnMtMi0uOS0yLTIgLjktMiAyLTIgMiAuOSAyIDJ6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMikiLz48cGF0aCBkPSJNNDAgNDhjMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyem0tMjAtMjBjMCAxLjEtLjkgMi0yIDJzLTItLjktMi0yIC45LTIgMi0yIDIgLjkgMiAyem0yMC0yMGMwIDEuMS0uOSAyLTIgMnMtMi0uOS0yLTIgLjktMiAyLTIgMiAuOSAyIDJ6TTIwIDQ4YzAgMS4xLS45IDItMiAycy0yLS45LTItMiAuOS0yIDItMiAyIC45IDIgMnoiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4xKSIvPjwvZz48L3N2Zz4=')]"></div>
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Micro Tasks, Macro Impact</h1>
          <p className="text-lg mb-8 opacity-90">
            Complete small tasks from anywhere, get paid instantly. 
            AI-verified quality, crypto-powered payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-brand-blue hover:bg-white/90">
              Find Tasks
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              Post a Task
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-t-brand-blue">
            <CardHeader>
              <CardTitle>1. Browse Available Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Explore a variety of microtasks posted by companies worldwide. 
                Filter by category, difficulty, and payment amount.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-brand-teal">
            <CardHeader>
              <CardTitle>2. Complete & Submit Work</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Work on tasks from anywhere, anytime. Submit your work through our 
                platform for AI-powered quality verification.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-brand-blue">
            <CardHeader>
              <CardTitle>3. Get Paid Instantly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Once verified, receive payment directly to your crypto wallet in USDC 
                stablecoins. No delays, no middlemen.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Tasks */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Tasks</h2>
          <div className="flex gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search tasks..."
                className="pl-9 pr-4 py-2 text-sm rounded-md border border-input"
              />
            </div>
            <Button>View All Tasks</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="task-card">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Data Labeling for AI Training</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-outline">AI Training</span>
                    <span className="badge badge-primary">Easy</span>
                  </div>
                </div>
                <div className="flex items-center bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue font-medium">
                  <span>$15.00</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                Label 50 images of street scenes for our autonomous driving AI. Identify pedestrians, vehicles, road signs, and traffic lights.
              </p>
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-6 flex justify-between">
              <div className="text-sm text-muted-foreground">30-45 min</div>
              <Button>Start Task</Button>
            </CardFooter>
          </Card>
          
          <Card className="task-card">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Content Moderation</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-outline">Moderation</span>
                    <span className="badge badge-secondary">Medium</span>
                  </div>
                </div>
                <div className="flex items-center bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue font-medium">
                  <span>$18.50</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                Review a batch of 100 social media posts and flag any inappropriate content according to our community guidelines.
              </p>
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-6 flex justify-between">
              <div className="text-sm text-muted-foreground">45-60 min</div>
              <Button>Start Task</Button>
            </CardFooter>
          </Card>
          
          <Card className="task-card">
            <CardHeader className="px-6 pt-6 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">Audio Transcription</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="badge badge-outline">Transcription</span>
                    <span className="badge badge-secondary">Medium</span>
                  </div>
                </div>
                <div className="flex items-center bg-brand-blue/10 px-3 py-1 rounded-full text-brand-blue font-medium">
                  <span>$22.75</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-2">
              <p className="text-sm text-muted-foreground line-clamp-2">
                Compare AI-generated transcriptions with original audio recordings and correct any inaccuracies.
              </p>
            </CardContent>
            <CardFooter className="px-6 pt-2 pb-6 flex justify-between">
              <div className="text-sm text-muted-foreground">50-70 min</div>
              <Button>Start Task</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-muted p-8 rounded-xl text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join our global community of workers and businesses. Post tasks, complete work, and participate in the future of decentralized labor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <a href="/complete-tasks">Find Tasks to Complete</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="/post-task">Post a Task</a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
