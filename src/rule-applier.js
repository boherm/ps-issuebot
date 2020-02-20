/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
var Rule = require('./rule.js');

module.exports = class RuleApplier {

  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {PullRequestDataProvider} pullRequestDataProvider
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor (config, issueDataProvider, pullRequestDataProvider, githubApiClient, logger) {
    this.config = config;
    this.issueDataProvider = issueDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  /**
   * @param {array} rules
   * @param {Context} context
   */
  applyRules (rules, context) {
    for (const rule of rules) {
      this.logger.debug('[Rule Applier] Applying rule ' + rule);

      switch (rule) {
        case Rule.A1:
          this.applyRuleA1(context);
          break;

        case Rule.B2:
          this.applyRuleB2(context);
          break;

        case Rule.C1:
          this.applyRuleC1(context);
          break;

        case Rule.C2:
          this.applyRuleC2(context);
          break;

        case Rule.D1:
          this.applyRuleD1(context);
          break;

        case Rule.D2:
          this.applyRuleD2(context);
          break;

        case Rule.D3:
          this.applyRuleD3(context);
          break;

        case Rule.D4:
          this.applyRuleD4(context);
          break;

        case Rule.E1:
          this.applyRuleE1(context);
          break;

        case Rule.E3:
          this.applyRuleE3(context);
          break;

        case Rule.E4:
          this.applyRuleE4(context);
          break;

        case Rule.E5:
          this.applyRuleE5(context);
          break;

        case Rule.E6:
          this.applyRuleE6(context);
          break;

        case Rule.F1:
          this.applyRuleF1(context);
          break;

        default:
          this.logger.error('[Rule Applier] Cannot apply ' + rule);
      }
    }
  }

  isAutomaticLabel (label) {
    const automaticLabels = Object.values(this.config.labels).filter(function (el) { return el.automatic === true; });
    for (let i = 0; i < automaticLabels.length; i++) {
      if (automaticLabels[i].name === label.name) {
        return true;
      }
    }
    return false;
  }

  /**
   * Apply Rule A1
   *
   * @param {Context} context
   *
   * @private
   */
  async applyRuleA1 (context) {
    const todoColumnId = this.config.kanbanColumns.toDoColumnId;
    const issueId = context.payload.issue.id;

    this.githubApiClient.projects.createCard({
      column_id: todoColumnId,
      content_id: issueId,
      content_type: 'Issue'
    });
  }

  /**
   * @param {Context} context
   */
  async applyRuleB2 (context) {
    const issueId = context.payload.issue.number;

    const getRelatedCardPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
    const relatedCard = await getRelatedCardPromise;

    this.githubApiClient.projects.deleteCard({card_id: relatedCard.id});
  }

  /**
   * @param {Context} context
   */
  async applyRuleC1 (context) {
    await this.moveCardTo(context.payload.issue.number, this.config.kanbanColumns.toDoColumnId);
  }

  /**
   * @param {Context} context
   */
  async applyRuleC2 (context) {
    await this.moveCardTo(context.payload.issue.number, this.config.kanbanColumns.doneColumnId);
  }

  /**
   * @param {Context} context
   */
  async applyRuleD1 (context) {
    const issueId = context.payload.issue.number;
    const newLabel = context.payload.label;

    for (const label of context.payload.issue.labels) {
      if (this.isAutomaticLabel(label) && newLabel.id !== label.id) {
        this.logger.info(`[Rule Applier] D1 - Remove label ${label.name}`);

        await this.githubApiClient.issues.removeLabel({
          issue_number: issueId,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          name: label.name
        })
      }
    }
  }

  /**
   * @param {Context} context
   */
  async applyRuleD2 (context) {
    const issueId = context.payload.issue.number;
    this.logger.info(`[Rule Applier] D2 - Add label ${this.config.labels.todo.name}`);

    await this.githubApiClient.issues.addLabels({
      issue_number: issueId,
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      labels: { labels: [this.config.labels.todo.name] }
    })
  }

  /**
   * @param {Context} context
   */
  async applyRuleD3 (context) {
    const issueId = context.payload.issue.number;

    for (const label of context.payload.issue.labels) {
      if (this.isAutomaticLabel(label)) {
        this.logger.info(`[Rule Applier] D3 - Remove label ${label.name}`);

        await this.githubApiClient.issues.removeLabel({
          issue_number: issueId,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          name: label.name
        })
      }
    }
  }

  /**
   * @param {Context} context
   */
  async applyRuleD4 (context) {
    const issueId = context.payload.issue.number;

    for (const label of context.payload.issue.labels) {
      if (this.isAutomaticLabel(label)) {
        this.logger.info(`[Rule Applier] D3 - Remove label ${label.name}`);

        await this.githubApiClient.issues.update({
          issue_number: issueId,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          state: 'open'
        })
      }
    }
  }

  async applyRuleE1(context) {
    const pullRequestId = context.payload.issue.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        await this.githubApiClient.issues.update({
          issue_number: referencedIssue,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          milestone: context.payload.issue.milestone.number
        })
      }
    }
  }

  async applyRuleE3(context) {
    const pullRequestId = context.payload.pull_request.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        await this.moveCardTo(referencedIssue, this.config.kanbanColumns.toBeTestedColumnId);
      }
    }
  }

  async applyRuleE4(context) {
    const pullRequestId = context.payload.pull_request.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        await this.moveCardTo(referencedIssue, this.config.kanbanColumns.toBerMergedColumnId);
      }
    }
  }

  async applyRuleE5(context) {
    const pullRequestId = context.payload.pull_request.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        await this.moveCardTo(referencedIssue, this.config.kanbanColumns.doneColumnId);

        this.logger.info(`[Rule Applier] E5 - Add label ${this.config.labels.fixed.name}`);

        await this.githubApiClient.issues.addLabels({
          issue_number: referencedIssue,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          labels: { labels: [this.config.labels.fixed.name] }
        });
      }
    }
  }

  async applyRuleE6(context) {
    const pullRequestId = context.payload.pull_request.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        this.logger.info(`[Rule Applier] E6 - Re-open issue ${referencedIssue}`);

        await this.githubApiClient.issues.update({
          issue_number: referencedIssue,
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          state: 'open'
        })
      }
    }
  }

  async applyRuleF1(context) {
    const pullRequestId = context.payload.pull_request.number;

    const referencedIssues = await this.pullRequestDataProvider.getReferencedIssues(
        pullRequestId,
        context.payload.repository.owner.login,
        context.payload.repository.name
    );

    if (referencedIssues.length > 0) {
      for (const referencedIssue of referencedIssues) {
        await this.moveCardTo(referencedIssue, this.config.kanbanColumns.inProgressColumnId);
      }
    }
  }

  async moveCardTo(issueId, columnId) {
    this.logger.info(`Moving issue #${issueId} card in Kanban`);

    const getRelatedCardPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
    const relatedCard = await getRelatedCardPromise;

    this.githubApiClient.projects.moveCard({
      card_id: relatedCard.id,
      position: 'bottom',
      column_id: columnId
    });
  }
};
