<?php

namespace App\Notifications;

use App\Models\ClassModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentRemovedToClass extends Notification
{
    use Queueable;

    protected $class;

    /**
     * Create a new notification instance.
     */
    public function __construct(ClassModel $class)
    {
        $this->class = $class;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            'class_id'   => $this->class->id,
            'class_name' => $this->class->name,
            'message'    => "You have been removed from {$this->class->name}",
            'removed_at' => now(),
        ];
    }
}
