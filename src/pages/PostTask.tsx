
import NavBar from "@/components/NavBar";
import TaskPostForm from "@/components/TaskPostForm";

const PostTask = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 container py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Post a New Task</h1>
          <p className="text-muted-foreground mb-8">
            Create a new task for our global workforce to complete. Our AI system will verify the quality of submissions.
          </p>
          <TaskPostForm />
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2025 TaskHived - AI-Verified Microtask Marketplace
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PostTask;
