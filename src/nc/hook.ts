import { ref, reactive, readonly, computed, watchEffect } from "vue";
import { api } from "./api/api";
import { wrapAsync } from "./util";

export function useAutoSave(
  filename: string,
  paint: MiniPaintApp,
  enabled: Trackable<boolean>
) {
  const saving = ref(false);
  const savingError = ref(null as string | null);
  const editSequence = ref(0);
  const lastSavedSequence = ref(0);
  const unsavedOpCnt = computed(() =>
    Math.abs(editSequence.value - lastSavedSequence.value)
  );
  const lastSavedAt = ref(0);
  let doSave = async () => {
    lastSavedAt.value = Date.now();
    const thisEditSequence = editSequence.value;
    const json = JSON.parse(paint.FileSave.export_as_json());
    json._tplVars = paint.AppConfig._tplVarManager.tplVars;
    await api.saveTemplate(filename, json);
    lastSavedSequence.value = thisEditSequence;
  };

  doSave = wrapAsync(doSave, saving, savingError);

  let saveTimer = 0;
  const onChange = () => {
    const now = Date.now();

    if (!enabled.value || unsavedOpCnt.value === 0) return;

    if (saving.value || now - lastSavedAt.value < 5e3) {
      if (!saveTimer) {
        saveTimer = window.setTimeout(() => {
          saveTimer = 0;
          onChange();
        }, 5e3);
      }
      return;
    }

    doSave();
  };

  paint.onPaintChange = (addSeq) => {
    editSequence.value += addSeq;
    onChange();
  };

  watchEffect(() => enabled.value && onChange());
  //   watchEffect(() => console.log({ editSequence: editSequence.value }));

  // hack: disable mini-paint original alert on leave
  window.addEventListener("beforeunload", function (e) {
    if (unsavedOpCnt.value == 0) {
      e.stopPropagation();
    }
  });

  return reactive({
    unsavedOpCnt,
    saving: readonly(saving),
    savingError: readonly(savingError),
    save: () => saving.value || doSave(),
  });
}
