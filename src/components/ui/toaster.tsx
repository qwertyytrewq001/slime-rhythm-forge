import { useStageSize } from '@/utils/stage';
import { useToast } from "../../hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

export function AppToaster() {
  const { toasts } = useToast();
  const small = useStageSize().h < 520; // a phone: a slim strip at the top that goes away by itself

  return (
    <ToastProvider duration={small ? 3500 : 5000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={small ? '!space-x-2 !rounded-xl !border-2 !px-3 !py-1.5 !pr-9' : undefined}>
            <div className={small ? 'grid gap-0' : 'grid gap-1'}>
              {title && <ToastTitle className={small ? 'text-[13px] leading-tight' : 'text-lg tracking-wide'}>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={small ? 'text-[11px] leading-tight font-semibold opacity-85' : 'text-sm font-semibold opacity-85'}>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className={small ? '!right-1 !top-1/2 !-translate-y-1/2 [&_img]:!h-6 [&_img]:!w-6' : undefined} />
          </Toast>
        );
      })}
      <ToastViewport className={small ? '!fixed !bottom-auto !left-1/2 !right-auto !top-1 !w-[330px] !-translate-x-1/2 !p-0' : undefined} />
    </ToastProvider>
  );
}
