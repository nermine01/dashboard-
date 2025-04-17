import { Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/Tabs";

const AlertFilters = ({
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  setPriorityFilter,
  setCategoryFilter,
  setTypeFilter,
  priorityFilter,
  categoryFilter,
  typeFilter,
}) => {
  const hasFilters = priorityFilter || categoryFilter || typeFilter;

  const clearFilters = () => {
    setPriorityFilter(null);
    setCategoryFilter(null);
    setTypeFilter(null);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto bg-gray-100 dark:bg-gray-800">
          {["All Alerts", "Unread", "Critical", "Read"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-700 transition-colors"
            >
              {tab.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-8"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                active={!!priorityFilter}
              >
                <Filter className="h-4 w-4" />
                Priority
                {priorityFilter && (
                  <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {priorityFilter}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
              {["high", "medium", "low"].map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() =>
                    setPriorityFilter(
                      priorityFilter === priority ? null : priority
                    )
                  }
                  className={`cursor-pointer ${
                    priorityFilter === priority
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}{" "}
                  Priority
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                active={!!categoryFilter}
              >
                <Filter className="h-4 w-4" />
                Category
                {categoryFilter && (
                  <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {categoryFilter}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
              {["inventory", "forecast", "recall"].map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() =>
                    setCategoryFilter(
                      categoryFilter === category ? null : category
                    )
                  }
                  className={`cursor-pointer ${
                    categoryFilter === category
                      ? "bg-gray-100 dark:bg-gray-700"
                      : ""
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <AnimatePresence>
            {hasFilters && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AlertFilters;
