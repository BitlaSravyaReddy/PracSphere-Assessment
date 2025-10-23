// This component renders a carousel view of tasks using Swiper.js, allowing users to navigate through tasks with edit and delete options.
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow, Autoplay } from "swiper/modules";
import styles from "../styles/TaskCarousel.module.scss";

// Task type definition
interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pending" | "inprogress" | "completed";
  userId: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
}

// Props for the carousel component
interface TaskCarouselProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  calculateProgress: (task: Task) => number;
}

export default function TaskCarousel({ tasks, onEdit, onDelete, calculateProgress }: TaskCarouselProps) {
  // Show empty state if there are no tasks
  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No tasks to display in carousel view</p>
      </div>
    );
  }

  // Get the CSS class for the status badge
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return styles.pending;
      case "inprogress":
        return styles.inprogress;
      case "completed":
        return styles.completed;
      default:
        return "";
    }
  };

  // Get the label to display for the status
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "inprogress":
        return "In Progress";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  // Check if a task is overdue (due date is before today)
  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  // Format a date string as "MMM DD, YYYY"
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.container}>
      {/* Swiper carousel setup */}
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        loop={tasks.length > 1}
        autoplay={{ delay: 4000, disableOnInteraction: true }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 100,
          modifier: 2,
          slideShadows: true,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
        className={styles.swiper}
      >
        {/* Render each task as a slide */}
        {tasks.map((task) => (
          <SwiperSlide key={task._id}>
            <div className={styles.slideContent}>
              {/* Task status badge */}
              <div className={styles.taskHeader}>
                <span className={`${styles.statusBadge} ${getStatusColor(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
              </div>

              {/* Task title */}
              <h3 className={styles.taskTitle}>{task.title}</h3>

              {/* Task description */}
              <p className={styles.taskDescription}>
                {task.description || "No description provided"}
              </p>

              {/* Task meta info: due date and subtasks */}
              <div className={styles.taskMeta}>
                {/* Due date, with overdue warning if needed */}
                <div className={`${styles.metaItem} ${isOverdue(task.dueDate) ? styles.overdue : ''}`}>
                  <span className={`material-symbols-outlined ${styles.icon}`}>
                    {isOverdue(task.dueDate) ? 'warning' : 'calendar_today'}
                  </span>
                  <span>
                    {isOverdue(task.dueDate) ? 'Overdue: ' : 'Due: '}
                    {formatDate(task.dueDate)}
                  </span>
                </div>

                {/* Subtasks count */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className={styles.metaItem}>
                    <span className={`material-symbols-outlined ${styles.icon}`}>checklist</span>
                    <span>
                      {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} subtasks
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar for subtasks */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className={styles.progress}>
                  <div className={styles.progressLabel}>
                    Progress: {calculateProgress(task)}%
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${calculateProgress(task)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Ui for Edit and Delete buttons */}
              <div className={styles.taskActions}>
                <button
                  onClick={() => onEdit(task)}
                  className={`${styles.actionButton} ${styles.editButton}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                  Edit
                </button>
                <button
                  onClick={() => onDelete(task._id)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                  Delete
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}