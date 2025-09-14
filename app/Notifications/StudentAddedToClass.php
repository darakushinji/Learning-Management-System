<?php

namespace App\Notifications;

use App\Models\ClassModel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentAddedToClass extends Notification
{
    use Queueable;

    protected $class;

    public function __construct(ClassModel $class)
    {
        $this->class = $class;
    }

    public function via($notifiable)
    {
        return ['database']; // or ['mail', 'database']
    }

    public function toArray(object $notifiable): array
    {
        return [
            'class_id'   => $this->class->id,
            'class_name' => $this->class->name,
            'message'    => "You have been added to {$this->class->name}",
            'added_at'   => now(),
        ];
    }
}
