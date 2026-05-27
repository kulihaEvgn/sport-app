"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { useClientInitData } from "@/components/tma/use-raw-init-data";
import { useTelegramBackButton } from "@/components/tma/use-telegram-back-button";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import {
  MUSCLE_GROUPS,
  muscleGroupLabels,
  type MuscleGroup,
  type SerializedExercise,
} from "@/lib/exercises";
import { cn } from "@/lib/utils";

type ExerciseFormState = {
  name: string;
  muscleGroup: MuscleGroup;
  difficulty: number;
  videoUrl: string;
  imageUrl: string;
};

const emptyForm = (): ExerciseFormState => ({
  name: "",
  muscleGroup: "CHEST",
  difficulty: 3,
  videoUrl: "",
  imageUrl: "",
});

export default function ExercisesPage() {
  useTelegramBackButton();
  const initData = useClientInitData();
  const [items, setItems] = useState<SerializedExercise[]>([]);
  const [filter, setFilter] = useState<MuscleGroup | "ALL">("ALL");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadExercises = useCallback(
    async (filterOverride?: MuscleGroup | "ALL") => {
      if (!initData) {
        setLoadError("Нет initData (откройте через Telegram или dev mock)");
        return;
      }

      const activeFilter = filterOverride ?? filter;
      const query =
        activeFilter === "ALL"
          ? ""
          : `?muscleGroup=${encodeURIComponent(activeFilter)}`;
      const response = await apiFetch(`/api/exercises${query}`, { initData });
      const body = (await response.json()) as {
        items?: SerializedExercise[];
        error?: string;
      };

      if (!response.ok) {
        setLoadError(body.error ?? `HTTP ${response.status}`);
        return;
      }

      setItems(body.items ?? []);
      setLoadError(null);
    },
    [filter, initData],
  );

  useEffect(() => {
    if (initData === undefined) return;
    void loadExercises();
  }, [initData, loadExercises]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!initData) return;

    setSubmitting(true);
    setFormMessage(null);

    try {
      const payload = {
        name: form.name.trim(),
        muscleGroup: form.muscleGroup,
        difficulty: form.difficulty,
        videoUrl: form.videoUrl.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };
      const wasEditing = Boolean(editingId);

      const response = editingId
        ? await apiFetch(`/api/exercises/${editingId}`, {
            initData,
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await apiFetch("/api/exercises", {
            initData,
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const body = (await response.json()) as SerializedExercise & {
        error?: string;
      };

      if (!response.ok) {
        setFormMessage(body.error ?? `HTTP ${response.status}`);
        return;
      }

      const createdGroup = body.muscleGroup ?? form.muscleGroup;
      setForm(emptyForm());
      setEditingId(null);
      setFilter(createdGroup);
      setFormMessage(
        wasEditing ? "Упражнение обновлено" : "Упражнение добавлено",
      );
      await loadExercises(createdGroup);
    } catch {
      setFormMessage("Не удалось сохранить упражнение");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(exercise: SerializedExercise) {
    setEditingId(exercise.id);
    setForm({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      difficulty: exercise.difficulty,
      videoUrl: exercise.videoUrl ?? "",
      imageUrl: exercise.imageUrl ?? "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
  }

  async function handleDelete(id: string) {
    if (!initData) return;
    if (!window.confirm("Удалить упражнение?")) return;

    setSubmitting(true);
    setFormMessage(null);

    try {
      const response = await apiFetch(`/api/exercises/${id}`, {
        initData,
        method: "DELETE",
      });
      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFormMessage(body.error ?? `HTTP ${response.status}`);
        return;
      }

      if (editingId === id) {
        cancelEdit();
      }
      setFormMessage("Упражнение удалено");
      await loadExercises();
    } catch {
      setFormMessage("Не удалось удалить упражнение");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col gap-6 p-6 pb-24">
      <div>
        <h1 className="text-xl font-semibold">Упражнения</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Каталог и свои упражнения
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Группа мышц</h2>
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            label="Все"
          />
          {MUSCLE_GROUPS.map((group) => (
            <FilterChip
              key={group}
              active={filter === group}
              onClick={() => setFilter(group)}
              label={muscleGroupLabels[group]}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">
          Список {items.length > 0 ? `(${items.length})` : ""}
        </h2>
        {loadError ? (
          <p className="text-destructive text-sm">{loadError}</p>
        ) : initData === undefined ? (
          <p className="text-muted-foreground text-sm">Загрузка…</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Нет упражнений для выбранного фильтра
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((exercise) => (
              <li
                key={exercise.id}
                className="bg-card space-y-2 rounded-lg border p-4 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {muscleGroupLabels[exercise.muscleGroup]} · сложность{" "}
                      {exercise.difficulty}/5
                      {exercise.isOwn ? " · своё" : " · каталог"}
                    </p>
                  </div>
                  {exercise.isOwn ? (
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => startEdit(exercise)}
                        disabled={submitting}
                      >
                        Изм.
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        onClick={() => void handleDelete(exercise.id)}
                        disabled={submitting}
                      >
                        Удал.
                      </Button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium">
            {editingId ? "Редактирование" : "Новое упражнение"}
          </h2>
          {editingId ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={cancelEdit}
              disabled={submitting}
            >
              Отмена
            </Button>
          ) : null}
        </div>

        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="bg-card space-y-3 rounded-lg border p-4"
          noValidate
        >
          {formMessage ? (
            <p
              className={cn(
                "text-sm",
                formMessage.includes("не удал")
                  ? "text-destructive"
                  : "text-primary",
              )}
            >
              {formMessage}
            </p>
          ) : null}
          <Field label="Название">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className={inputClassName}
              placeholder="Жим гантелей"
            />
          </Field>

          <Field label="Группа мышц">
            <select
              value={form.muscleGroup}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  muscleGroup: event.target.value as MuscleGroup,
                }))
              }
              className={inputClassName}
            >
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {muscleGroupLabels[group]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Сложность (1–5)">
            <input
              required
              type="number"
              min={1}
              max={5}
              value={form.difficulty}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  difficulty: Number(event.target.value),
                }))
              }
              className={inputClassName}
            />
          </Field>

          <Field label="Видео URL (необязательно)">
            <input
              type="text"
              inputMode="url"
              value={form.videoUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  videoUrl: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>

          <Field label="Картинка URL (необязательно)">
            <input
              type="text"
              inputMode="url"
              value={form.imageUrl}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  imageUrl: event.target.value,
                }))
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>

          <button
            type="submit"
            disabled={submitting || !initData}
            className="bg-primary text-primary-foreground hover:bg-primary/80 inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-sm font-medium disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting
              ? "Сохранение…"
              : editingId
                ? "Сохранить"
                : "Создать"}
          </button>
        </form>
      </section>

      <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
        На главную
      </Button>
    </main>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

const inputClassName =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border px-3 py-2 text-sm outline-none focus-visible:ring-3";
