'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { PlanType, PlanConfig } from '@/types/billing';

interface PlanCardProps {
  plan: PlanType;
  config: PlanConfig;
  currentPlan: PlanType;
  onSelect: (plan: PlanType) => void;
  disabled?: boolean;
  recommended?: boolean;
}

export function PlanCard({
  plan,
  config,
  currentPlan,
  onSelect,
  disabled = false,
  recommended = false,
}: PlanCardProps) {
  const isCurrent = plan === currentPlan;
  const isFree = plan === 'FREE';

  return (
    <div
      className={`
        relative backdrop-blur-md rounded-xl overflow-hidden transition-all duration-300
        ${
          isCurrent
            ? 'bg-blue-500/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
            : 'bg-white/10 dark:bg-gray-900/10 border border-white/20 dark:border-gray-700/30 hover:border-white/40 dark:hover:border-gray-600/50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={() => !disabled && !isCurrent && onSelect(plan)}
    >
      {recommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
          Aanbevolen
        </div>
      )}

      <div className="p-6">
        {/* Plan name and price */}
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {config.name}
          </h3>
          <div className="flex items-baseline">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">
              €{config.price}
            </span>
            {!isFree && (
              <span className="text-gray-600 dark:text-gray-400 ml-2">
                /maand
              </span>
            )}
          </div>
        </div>

        {/* Features list */}
        <ul className="space-y-3 mb-6">
          {config.features.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>

        {/* Limits */}
        <div className="mb-6 pt-4 border-t border-white/10 dark:border-gray-700/30">
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div>
              <span className="font-semibold">Users: </span>
              {config.features.maxUsers === null
                ? 'Onbeperkt'
                : config.features.maxUsers}
            </div>
            <div>
              <span className="font-semibold">Widgets: </span>
              {config.features.maxWidgets === null
                ? 'Onbeperkt'
                : config.features.maxWidgets}
            </div>
            <div>
              <span className="font-semibold">Data behoud: </span>
              {config.features.dataRetention === null
                ? 'Onbeperkt'
                : `${config.features.dataRetention} dagen`}
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !isCurrent) {
              onSelect(plan);
            }
          }}
          disabled={disabled || isCurrent}
          className={`
            w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
            ${
              isCurrent
                ? 'bg-blue-500 text-white cursor-default'
                : disabled
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isCurrent ? 'Huidig plan' : isFree ? 'Downgraden' : 'Upgraden'}
        </button>
      </div>
    </div>
  );
}
