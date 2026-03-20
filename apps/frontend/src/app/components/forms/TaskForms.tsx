import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupTextarea,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router";
import { TaskStatusEnum, User } from "@/app/types";
import useTaskModal from "@/app/hooks/use-task-modal";
import {
  createTask,
  getTaskById,
  updateTask,
} from "@/app/action/planing.action";
import { getAllUsers } from "@/app/action/user.action";

const formSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(3, "Task title must be at least 3 characters.")
    .max(120, "Task title must be at most 120 characters."),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatusEnum),
  assignedUsers: z.array(z.string()).optional(),
});

const TaskForms = ({ type }: { type: "edit" | "add" }) => {
  //const { milestoneId } = useParams();
  const milestoneId= "69bc78a30912805125e58f72"
  const { id, onClose, onTaskChange } = useTaskModal();
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: undefined,
      title: "",
      description: "",
      status: TaskStatusEnum.BACKLOG,
      assignedUsers: [],
    },
  });

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      if (response?.status === 200 && Array.isArray(response.data)) {
        setAvailableUsers(response.data);
      }
    } catch {
      toast.error("Failed to load users.");
    }
  };

  const loadTaskData = async () => {
    if (type !== "edit" || !id) {
      return;
    }

    try {
      const res = await getTaskById(String(id));
      if (res.status === 200) {
        form.reset({
          id: res.data._id,
          title: res.data.title ?? "",
          description: res.data.description ?? "",
          status: res.data.status ?? TaskStatusEnum.BACKLOG,
          assignedUsers: Array.isArray(res.data.assignedUsers)
            ? res.data.assignedUsers
            : [],
        });
      }
    } catch {
      toast.error("Failed to load task data. Please try again.");
    }
  };

  useEffect(() => {
    loadUsers();
    loadTaskData();
  }, [type, id]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (type === "add" && !milestoneId) {
      toast.error("Milestone id is missing in route.");
      return;
    }
    console.log("Form data to submit:", data);

    try {
      if (type === "add") {
        console.log("Creating task with data:", data);
        const res = await createTask({
          title: data.title,
          description: data.description,
          milestoneId: milestoneId as string,
          status: data.status,
          assignedUsers: data.assignedUsers,
        });

        if (res.status === 201 || res.status === 200) {
          toast.success("Task created successfully");
          form.reset({
            id: undefined,
            title: "",
            description: "",
            status: TaskStatusEnum.BACKLOG,
            assignedUsers: [],
          });
          onClose();
          onTaskChange();
        } else {
          toast.error("Failed to create task");
        }
      } else {
        if (!data.id) {
          toast.error("Task id is missing.");
          return;
        }

        const res = await updateTask(data.id, {
          title: data.title,
          description: data.description,
          status: data.status,
          assignedUsers: data.assignedUsers,
        });

        if (res.status === 200) {
          toast.success("Task updated successfully");
          onClose();
          onTaskChange();
        } else {
          toast.error("Failed to update task");
        }
      }
    } catch {
      toast.error("Failed to save task. Please try again.");
    }
  };

  return (
    <>
      <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-title">Task Title</FieldLabel>
                <Input
                  {...field}
                  id="form-rhf-demo-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Enter task title"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="form-rhf-demo-description"
                    placeholder="Enter task description"
                    rows={6}
                    className="min-h-24 resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {(field.value ?? "").length}/500 characters
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="assignedUsers"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Assigned Users</FieldLabel>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
                  {availableUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No users available.
                    </p>
                  ) : (
                    availableUsers.map((user) => {
                      const userId = user._id;
                      const label =
                        user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email || user.nom || user.prenom || userId;
                      const isChecked = (field.value ?? []).includes(userId);

                      return (
                        <div className="flex items-center gap-2" key={userId}>
                          <Checkbox
                            checked={isChecked}
                            id={`task-user-${userId}`}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...(field.value ?? []), userId]);
                                return;
                              }

                              field.onChange(
                                (field.value ?? []).filter((id) => id !== userId),
                              );
                            }}
                          />
                          <label
                            className="cursor-pointer text-sm"
                            htmlFor={`task-user-${userId}`}
                          >
                            {label}
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-demo-status">Status</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full" id="form-rhf-demo-status">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskStatusEnum).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Field className="justify-end" orientation="horizontal">
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-rhf-demo">
          Submit
        </Button>
      </Field>
    </>
  );
};

export default TaskForms;
