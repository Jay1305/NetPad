using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NetPad.Exceptions;
using NetPad.Scripts;
using NetPad.Sessions;
using NetPad.UiInterop;

namespace NetPad.Controllers
{
    [ApiController]
    [Route("session")]
    public class SessionController : Controller
    {
        private readonly ISession _session;
        private readonly IScriptRepository _scriptRepository;
        private readonly IUiDialogService _uiDialogService;
        private readonly Settings _settings;

        public SessionController(ISession session, IScriptRepository scriptRepository, IUiDialogService uiDialogService, Settings settings)
        {
            _session = session;
            _scriptRepository = scriptRepository;
            _uiDialogService = uiDialogService;
            _settings = settings;
        }

        [HttpGet("environments/{scriptId:guid}")]
        public ScriptEnvironment GetEnvironment(Guid scriptId)
        {
            return _session.Get(scriptId) ?? throw new EnvironmentNotFoundException(scriptId);
        }

        [HttpGet("environments")]
        public IEnumerable<ScriptEnvironment> GetEnvironments()
        {
            return _session.Environments;
        }

        [HttpPatch("open")]
        public async Task Open([FromQuery] string scriptPath)
        {
            var script = await _scriptRepository.GetAsync(scriptPath) ?? throw new ScriptNotFoundException(scriptPath);
            await _session.OpenAsync(script);
        }

        [HttpPatch("close/{scriptId:guid}")]
        public async Task Close(Guid scriptId)
        {
            var scriptEnvironment = GetScriptEnvironment(scriptId);
            var script = scriptEnvironment.Script;

            var response = await _uiDialogService.AskUserIfTheyWantToSave(script);
            if (response == YesNoCancel.Cancel)
                return;

            if (script.IsDirty && response == YesNoCancel.Yes)
            {
                bool saved = await ScriptsController.SaveAsync(script, _scriptRepository, _uiDialogService, _settings);
                if (!saved)
                    return;
            }

            await _session.CloseAsync(scriptId);
        }

        [HttpGet("active")]
        public Guid? GetActive()
        {
            return _session.Active?.Script.Id;
        }

        [HttpPatch("set-active/{scriptId:guid}")]
        public async Task SetActive(Guid scriptId)
        {
            await _session.SetActive(scriptId);
        }

        private ScriptEnvironment GetScriptEnvironment(Guid id)
        {
            return _session.Get(id) ?? throw new ScriptNotFoundException(id);
        }
    }
}
