import useAuthStore from "../hooks/useAuth";
import Header from "../components/layout/Header";
import { Button } from "../components/ui/Button";
import { Lightbulb, MessageCircle, Bookmark, Bell } from "lucide-react";
import { useUserIdeas } from "../hooks/useIdeas";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const useAuth = useAuthStore;
  const { user, logout } = useAuth();
  const { data: ideas = [], isLoading } = useUserIdeas();

  if (!user) return <div>Please log in to view dashboard.</div>;

  const stats = {
    ideas: ideas.length || 0,
    comments: 0,
    bookmarks: 0,
    notifications: 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div>Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-12 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-primary mb-4">
              Welcome back, {user.email}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Here's what's happening with your ideas.
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Lightbulb className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-2xl font-bold mb-2">{stats.ideas}</h3>
            <p className="text-gray-600 dark:text-gray-300">Your Ideas</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <MessageCircle className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-2xl font-bold mb-2">{stats.comments}</h3>
            <p className="text-gray-600 dark:text-gray-300">Comments</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Bookmark className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-2xl font-bold mb-2">{stats.bookmarks}</h3>
            <p className="text-gray-600 dark:text-gray-300">Bookmarks</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
            <Bell className="w-12 h-12 text-secondary mb-4" />
            <h3 className="text-2xl font-bold mb-2">{stats.notifications}</h3>
            <p className="text-gray-600 dark:text-gray-300">Notifications</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-primary">
              Recent Ideas
            </h2>
            <Button asChild>
              <Link to="/ideas/new">Create New Idea</Link>
            </Button>
          </div>
          {ideas.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Lightbulb className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p>No ideas yet. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="flex items-center p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <Link to={`/ideas/${idea.id}`} className="block">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-primary hover:text-primary">
                        {idea.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>Status: {idea.status}</span>
                      <span>Global Score: {idea.global_score}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/ideas/${idea.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
